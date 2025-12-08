import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import puppeteer, { type LaunchOptions } from "puppeteer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("teams_profiles")
            .select("email_encrypted, password_encrypted")
            .eq("user_id", user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { error: "Teams not connected", needsCredentials: true },
                { status: 400 }
            );
        }

        let email: string, password: string;
        try {
            email = decrypt(profile.email_encrypted);
            password = decrypt(profile.password_encrypted);
        } catch {
            return NextResponse.json(
                { error: "Saved credentials corrupted. Please reconnect." },
                { status: 400 }
            );
        }


        const headlessPreference = process.env.PUPPETEER_HEADLESS?.toLowerCase();
        const headlessMode = headlessPreference === 'false' ? false : true;

        const launchOptions: LaunchOptions = {
            headless: headlessMode,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 720 }
        };

        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        const browser = await puppeteer.launch(launchOptions);

        try {
            const page = await browser.newPage();

            await page.goto("https://teams.microsoft.com", {
                waitUntil: "networkidle2",
                timeout: 60000
            });


            await page.waitForSelector('input[type="email"][name="loginfmt"]', { timeout: 10000 });
            await page.type('input[type="email"][name="loginfmt"]', email);

            await page.click('input[type="submit"][id="idSIButton9"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

            await new Promise(resolve => setTimeout(resolve, 2000));

            await page.waitForSelector('input[type="password"][name="passwd"]', { timeout: 20000 });
            await page.type('input[type="password"][name="passwd"]', password);

            await Promise.all([
                page.click('input[type="submit"][id="idSIButton9"]'),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
            ]);

            try {
                await page.waitForSelector('input[type="submit"][id="idSIButton9"]', { timeout: 5000 });
                const buttonText = await page.$eval('input[type="submit"][id="idSIButton9"]', el => (el as HTMLInputElement).value);
                if (buttonText === 'Yes' || buttonText === 'No') {
                    await page.click('input[type="button"][id="idBtn_Back"]');
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
                }
            } catch {
            }

            await new Promise(resolve => setTimeout(resolve, 5000));


            const assignmentSelectors = [
                'button[aria-label*="ssignment"]',
                '[data-tid="Assignments-app"]',
                '[data-tid="app-bar-assignments"]',
                'button[title*="ssignment"]',
                '[aria-label*="ssignments"]',
                'span:has-text("Assignments")',
                'button:has-text("Assignments")',
            ];

            let assignmentsClicked = false;
            for (const selector of assignmentSelectors) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.focus();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await button.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await page.keyboard.press('Enter');
                        assignmentsClicked = true;
                        break;
                    }
                } catch {
                    continue;
                }
            }

            if (!assignmentsClicked) {
                const clicked = await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('button, [role="button"], [role="tab"], a'));
                    for (const el of elements) {
                        if (el.textContent?.toLowerCase().includes('assignment')) {
                            (el as HTMLElement).click();
                            return true;
                        }
                    }
                    return false;
                });
                assignmentsClicked = clicked;
            }

            if (!assignmentsClicked) {
                await page.goto("https://teams.microsoft.com/_#/school/assignments", {
                    waitUntil: "networkidle2",
                    timeout: 30000
                });
            }

            await new Promise(resolve => setTimeout(resolve, 10000));


            await page.waitForSelector('iframe[data-tid="hwc-iframe"], iframe[src*="assignments.onenote.com"]', { timeout: 15000 });

            const iframeElement = await page.$('iframe[data-tid="hwc-iframe"], iframe[src*="assignments.onenote.com"]');
            if (!iframeElement) {
                throw new Error('Assignments iframe not found');
            }

            const iframe = await iframeElement.contentFrame();
            if (!iframe) {
                throw new Error('Could not access iframe content');
            }

            await new Promise(resolve => setTimeout(resolve, 5000));

            const debugHtml = await iframe.evaluate(() => {
                return document.body.innerHTML.substring(0, 5000);
            });

            const extractFromCurrentView = async () => {
                return await iframe.evaluate(() => {
                    const items: any[] = [];

                    const links = document.querySelectorAll('a[href*="assignment"], a[class*="title"], [role="link"], button[class*="title"]');

                    links.forEach((link) => {
                        const title = link.textContent?.trim();
                        const parent = link.closest('tr, [role="row"], [class*="row"], [class*="card"], [class*="item"], div[class*="list"]');

                        let dueDate = '';
                        if (parent) {
                            const dateEls = parent.querySelectorAll('[class*="date"], [class*="Date"], time, [class*="due"]');
                            dateEls.forEach(el => {
                                const text = el.textContent?.trim();
                                if (text && (text.includes('/') || text.includes('Jan') || text.includes('Feb') || text.includes('Mar') || text.includes('Apr') || text.includes('May') || text.includes('Jun') || text.includes('Jul') || text.includes('Aug') || text.includes('Sep') || text.includes('Oct') || text.includes('Nov') || text.includes('Dec'))) {
                                    dueDate = text;
                                }
                            });
                        }

                        if (title && title.length > 3 && !title.toLowerCase().includes('assignment') && !title.toLowerCase().includes('active') && !title.toLowerCase().includes('past due') && !title.toLowerCase().includes('complete')) {
                            items.push({
                                title,
                                dueDate,
                                status: 'pending'
                            });
                        }
                    });

                    if (items.length === 0) {
                        const rows = document.querySelectorAll('tr, [role="row"], [role="listitem"]');
                        rows.forEach((row) => {
                            const cells = row.querySelectorAll('td, div');
                            if (cells.length >= 2) {
                                const title = cells[0]?.textContent?.trim();
                                const dueDate = cells[1]?.textContent?.trim();
                                if (title && title.length > 3) {
                                    items.push({ title, dueDate, status: 'pending' });
                                }
                            }
                        });
                    }

                    return items;
                });
            };

            let allAssignments: any[] = [];
            const activeAssignments = await extractFromCurrentView();
            allAssignments = [...activeAssignments];

            try {
                await iframe.evaluate(() => {
                    const tabs = document.querySelectorAll('button, [role="tab"], a');
                    tabs.forEach(tab => {
                        if (tab.textContent?.toLowerCase().includes('past due')) {
                            (tab as HTMLElement).click();
                        }
                    });
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
                const pastDueAssignments = await extractFromCurrentView();
                pastDueAssignments.forEach(a => a.status = 'overdue');
                allAssignments = [...allAssignments, ...pastDueAssignments];
            } catch (e) {
            }

            try {
                await iframe.evaluate(() => {
                    const tabs = document.querySelectorAll('button, [role="tab"], a');
                    tabs.forEach(tab => {
                        if (tab.textContent?.toLowerCase().includes('complete')) {
                            (tab as HTMLElement).click();
                        }
                    });
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
                const completedAssignments = await extractFromCurrentView();
                completedAssignments.forEach(a => a.status = 'completed');
                allAssignments = [...allAssignments, ...completedAssignments];
            } catch (e) {
            }

            const seen = new Set<string>();
            const assignments = allAssignments
                .map(a => {
                    let cleanTitle = a.title;

                    const dueAtIndex = cleanTitle.indexOf('Due at');
                    const submittedAtIndex = cleanTitle.indexOf('Submitted at');
                    let cutIndex = Math.min(
                        dueAtIndex > 0 ? dueAtIndex : 999,
                        submittedAtIndex > 0 ? submittedAtIndex : 999
                    );
                    if (cutIndex < 999) {
                        cleanTitle = cleanTitle.substring(0, cutIndex).trim();
                    }

                    cleanTitle = cleanTitle.replace(/Paper \d+ - [A-Za-z\s]+/g, '');

                    cleanTitle = cleanTitle.replace(/\d+[A-Z]-[A-Za-z]+ - [A-Za-z]+/g, '');

                    cleanTitle = cleanTitle.replace(/\d+\/\d+ points?/gi, '');

                    cleanTitle = cleanTitle.replace(/Excused$/i, '');
                    cleanTitle = cleanTitle.replace(/Turned in$/i, '');

                    cleanTitle = cleanTitle.replace(/\d+[A-Z]$/g, '');


                    cleanTitle = cleanTitle.replace(/^([A-Z]{1,2})(?=\1)/g, '');

                    if (cleanTitle.length > 2) {
                        const firstTwo = cleanTitle.substring(0, 2);
                        if (firstTwo[0] === firstTwo[1] && firstTwo[0] === firstTwo[0].toUpperCase()) {
                            cleanTitle = cleanTitle.substring(1);
                        }
                    }

                    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

                    let parsedDueDate: string | null = null;
                    const dueTimeMatch = a.title.match(/Due at (\d{1,2}:\d{2}\s*(?:AM|PM))/i);
                    if (dueTimeMatch) {
                        const timeStr = dueTimeMatch[1];
                        const today = new Date();

                        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (timeParts) {
                            let hours = parseInt(timeParts[1]);
                            const minutes = parseInt(timeParts[2]);
                            const isPM = timeParts[3].toUpperCase() === 'PM';

                            if (isPM && hours !== 12) hours += 12;
                            if (!isPM && hours === 12) hours = 0;

                            const dueDate = new Date(today);
                            if (a.status === 'overdue') {
                                dueDate.setDate(dueDate.getDate() - 1);
                            }
                            dueDate.setHours(hours, minutes, 0, 0);

                            parsedDueDate = dueDate.toISOString();
                        }
                    }

                    let status = a.status;
                    if (status !== 'pending' && status !== 'completed' && status !== 'in_progress' && status !== 'overdue') {
                        status = 'pending';
                    }

                    return {
                        ...a,
                        title: cleanTitle,
                        dueDate: parsedDueDate,
                        status
                    };
                })
                .filter(a => {
                    if (seen.has(a.title)) return false;
                    if (a.title.length < 5) return false;
                    seen.add(a.title);
                    return true;
                });


            await browser.close();

            await supabase
                .from("teams_profiles")
                .update({ last_synced_at: new Date().toISOString() })
                .eq("user_id", user.id);

            for (const assignment of assignments) {
                const externalId = `${user.id}-teams-${assignment.title.replace(/\s+/g, "-").toLowerCase().slice(0, 50)}`;

                let dbStatus = assignment.status;
                if (dbStatus === 'overdue') {
                    dbStatus = 'pending';
                }

                const { error } = await supabase.from("assignments").upsert(
                    {
                        user_id: user.id,
                        external_id: externalId,
                        title: assignment.title,
                        description: "Teams assignment",
                        due_date: assignment.dueDate,
                        source: "teams",
                        status: dbStatus,
                        priority: "medium",
                    },
                    { onConflict: "user_id,source,external_id" }
                );

                if (error) {
                }
            }


            return NextResponse.json({
                success: true,
                message: "Teams synced successfully",
                data: { assignmentCount: assignments.length },
            });

        } catch (scrapeError: any) {
            await browser.close();
            return NextResponse.json(
                { error: `Failed to scrape Teams: ${scrapeError.message}` },
                { status: 500 }
            );
        }

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to sync Teams" },
            { status: 500 }
        );
    }
}
