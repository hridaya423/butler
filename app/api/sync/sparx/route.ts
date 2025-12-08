import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import puppeteer, { type LaunchOptions } from "puppeteer";


const DEFAULT_SCHOOL_URL = process.env.NEXT_PUBLIC_SPARX_SCHOOL_URL || "";

const SCHOOL_SELECTION_URL = "https://selectschool.sparx-learning.com/?app=sparx_learning&forget=1";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("sparx_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { error: "Sparx not connected. Please connect in settings." },
                { status: 400 }
            );
        }

        const username = decrypt(profile.encrypted_username);
        const password = decrypt(profile.encrypted_password);

        if (!username || !password) {
            return NextResponse.json(
                { error: "Invalid credentials. Please reconnect Sparx." },
                { status: 400 }
            );
        }

        const launchOptions: LaunchOptions = {
            headless: false,  // Show browser for debugging login flow
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 720 }
        };

        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        const browser = await puppeteer.launch(launchOptions);

        try {
            const page = await browser.newPage();

            const loginUrl = profile.use_default_school
                ? DEFAULT_SCHOOL_URL
                : SCHOOL_SELECTION_URL;

            await page.goto(loginUrl, { waitUntil: "networkidle2", timeout: 60000 });

            try {
                const cookieButton = await page.waitForSelector('#cookiescript_accept', { timeout: 5000 });
                if (cookieButton) {
                    await cookieButton.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch {
            }

            if (!profile.use_default_school && profile.school_name) {
                await page.waitForSelector('input[placeholder*="school"]', { timeout: 10000 });
                await page.type('input[placeholder*="school"]', profile.school_name);
                await new Promise(resolve => setTimeout(resolve, 1500));
                await page.click(".school-result:first-child");
                await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
            }

            await page.waitForSelector('input[type="text"], input[name="username"], input[type="email"]', { timeout: 15000 });

            const usernameInput = await page.$('input[type="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
            if (usernameInput) {
                await usernameInput.type(username);
            }

            const passwordInput = await page.$('input[type="password"]');
            if (passwordInput) {
                await passwordInput.type(password);
            }

            const submitButton = await page.$('button[type="submit"]') || await page.$('input[type="submit"]') || await page.$('button:has-text("Sign in")') || await page.$('button:has-text("Log in")');
            if (submitButton) {
                await submitButton.click();
            }

            await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, 3000));

            const pageTitle = await page.title();

            const studentInfo = await page.evaluate(() => {
                const studentNameEl = document.querySelector("[class*='StudentName']");
                const xpEl = document.querySelector("[class*='XPCount']");
                return {
                    studentName: studentNameEl?.textContent?.trim() || "",
                    totalXp: parseInt(xpEl?.textContent?.replace(/[^\d]/g, "") || "0") || 0,
                };
            });

            const accordionCount = await page.$$eval("._AccordionItem_9fvag_7", items => items.length);

            const packages: any[] = [];

            for (let i = 0; i < accordionCount; i++) {

                const triggers = await page.$$("._AccordionTrigger_9fvag_24");
                if (triggers[i]) {
                    const isOpen = await triggers[i].evaluate((el) => el.getAttribute('data-state') === 'open');
                    if (!isOpen) {
                        await triggers[i].click();
                    } else {
                    }
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }

                try {
                    await page.waitForSelector("._Task_1p2y5_1", { timeout: 3000 });
                } catch {
                }

                const packageData = await page.evaluate((index) => {
                    const items = document.querySelectorAll("._AccordionItem_9fvag_7");
                    const item = items[index];
                    if (!item) return null;

                    const titleEl = item.querySelector("._PackageLeft_s1pvn_28 span");
                    const rawTitle = titleEl?.textContent || "Unknown Homework";

                    let dueDate: string | null = null;
                    const dueDateMatch = rawTitle.match(/due\s+(\w+\s+\d+\w*\s+\w+(?:\s+\d+(?:am|pm)?)?)/i);
                    if (dueDateMatch) {
                        const dateStr = dueDateMatch[1];
                        const currentYear = new Date().getFullYear();
                        const months = ['january', 'february', 'march', 'april', 'may', 'june',
                            'july', 'august', 'september', 'october', 'november', 'december'];

                        for (const month of months) {
                            if (dateStr.toLowerCase().includes(month)) {
                                const dayMatch = dateStr.match(/(\d+)/);
                                const timeMatch = dateStr.match(/(\d+)(am|pm)/i);
                                if (dayMatch) {
                                    const day = parseInt(dayMatch[1]);
                                    const monthIndex = months.indexOf(month);
                                    let hour = 12;
                                    if (timeMatch) {
                                        hour = parseInt(timeMatch[1]);
                                        if (timeMatch[2].toLowerCase() === 'pm' && hour < 12) hour += 12;
                                    }
                                    dueDate = new Date(currentYear, monthIndex, day, hour, 0).toISOString();
                                }
                                break;
                            }
                        }
                    }

                    const completedEl = item.querySelector("._CompletedText_wmqxb_52");
                    const isCompleted = !!completedEl;

                    const bookworkImg = item.querySelector("._BookworkAccuracyIcon_1ug67_40");
                    let bookworkAccuracy = "unknown";
                    if (bookworkImg) {
                        const src = bookworkImg.getAttribute("src") || "";
                        if (src.includes("D02B4B")) bookworkAccuracy = "red";
                        else if (src.includes("amber") || src.includes("FF")) bookworkAccuracy = "amber";
                        else if (src.includes("green") || src.includes("0F0")) bookworkAccuracy = "green";
                        else bookworkAccuracy = "amber"; // default
                    }

                    const accordionContent = item.querySelector("._AccordionContent_9fvag_82");
                    const contentState = accordionContent?.getAttribute('data-state');

                    const topics: string[] = [];
                    const taskProgress: number[] = [];
                    const tasks = item.querySelectorAll("._Task_1p2y5_1");
                    let completedTasks = 0;
                    const totalTasks = tasks.length;

                    tasks.forEach((task) => {
                        const taskTitleContainer = task.querySelector("[class*='TaskTitle']");
                        if (!taskTitleContainer) return;

                        const firstSpan = taskTitleContainer.querySelector('span');
                        let taskTitle = "";

                        if (firstSpan) {
                            taskTitle = firstSpan.textContent || "";

                            taskTitle = taskTitle.replace(/^\d+\.\s*/, "");

                            taskTitle = taskTitle.replace(/\{[^}]+\}/g, ""); // Remove {ax^2+bx+c=0}
                            taskTitle = taskTitle.trim();
                        }

                        if (taskTitle && taskTitle.length > 2) {
                            topics.push(taskTitle);
                        }

                        const percentageEl = task.querySelector("[class*='TaskCompletionPercentage']");
                        const percentageText = percentageEl?.textContent || "0%";
                        const percentNum = parseInt(percentageText.replace('%', '')) || 0;
                        taskProgress.push(percentNum);

                        if (percentNum === 100) completedTasks++;
                    });

                    return {
                        title: rawTitle,
                        dueDate,
                        isCompleted,
                        completedTasks,
                        totalTasks,
                        bookworkAccuracy,
                        topics,
                        taskProgress,
                    };
                }, i);

                if (packageData) {

                    packages.push({
                        title: packageData.title,
                        due_date: packageData.dueDate,
                        status: packageData.isCompleted ? "completed" : packageData.completedTasks > 0 ? "in_progress" : "not_started",
                        completed_tasks: packageData.completedTasks,
                        total_tasks: packageData.totalTasks,
                        completion_progress: packageData.totalTasks > 0
                            ? Math.round((packageData.completedTasks / packageData.totalTasks) * 100)
                            : (packageData.isCompleted ? 100 : 0),
                        homework_type: "compulsory",
                        bookwork_accuracy: packageData.bookworkAccuracy,
                        topics: packageData.topics,
                    });
                }
            }

            const scraperResult = {
                studentName: studentInfo.studentName,
                totalXp: studentInfo.totalXp,
                packages,
            };


            await browser.close();

            const { error: profileError } = await supabase
                .from("sparx_profiles")
                .update({
                    student_name: scraperResult.studentName,
                    total_xp: scraperResult.totalXp,
                    last_synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", user.id);

            if (profileError) {
            } else {
            }

            for (const hw of scraperResult.packages) {
                const sparxId = `${user.id}-${hw.title.replace(/\s+/g, "-").toLowerCase()}`;

                const { error: hwError } = await supabase.from("sparx_homework").upsert(
                    {
                        user_id: user.id,
                        sparx_id: sparxId,
                        title: hw.title,
                        due_date: hw.due_date,
                        status: hw.status,
                        completion_progress: hw.completion_progress,
                        total_tasks: hw.total_tasks,
                        completed_tasks: hw.completed_tasks,
                        bookwork_accuracy: hw.bookwork_accuracy,
                        homework_type: hw.homework_type,
                        topics: hw.topics,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "sparx_id" }
                );

                if (hwError) {
                }


                const { error: assignmentError } = await supabase.from("assignments").upsert(
                    {
                        user_id: user.id,
                        external_id: sparxId,
                        title: hw.title,
                        due_date: hw.due_date,
                        source: "sparx",
                        status: hw.status === "completed" ? "completed" : "pending",
                        priority: hw.homework_type === "compulsory" ? "high" : "medium",
                        subject: "Maths",
                        description: hw.topics?.slice(0, 3).join(", ") || "Sparx Maths homework",
                    },
                    { onConflict: "user_id,source,external_id" }
                );

                if (assignmentError) {
                } else {
                }
            }


            return NextResponse.json({
                success: true,
                message: "Sparx synced successfully",
                data: {
                    studentName: scraperResult.studentName,
                    totalXp: scraperResult.totalXp,
                    homeworkCount: scraperResult.packages.length,
                },
            });
        } catch (error) {
            await browser.close();
            throw error;
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to sync Sparx" },
            { status: 500 }
        );
    }
}
