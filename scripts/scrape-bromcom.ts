/* eslint-disable @typescript-eslint/no-explicit-any */
import puppeteer, { type LaunchOptions } from 'puppeteer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface Assignment {
  title: string;
  description?: string;
  subject?: string;
  dueDate?: number;
  priority: 'low' | 'medium' | 'high';
  externalId?: string;
  status?: string;
  teacher?: string;
  submissionType?: string;
  score?: string;
}

export async function scrapeBromcom(email: string, password: string): Promise<Assignment[]> {
  console.log('🚀 Starting Bromcom scraper...');

  const headlessPreference = process.env.PUPPETEER_HEADLESS?.toLowerCase();
  const headlessMode = headlessPreference === 'false' ? false : true;

  const launchOptions: LaunchOptions = {headless: headlessMode,args: ['--no-sandbox', '--disable-setuid-sandbox'], defaultViewport: { width: 1280, height: 720 }  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    await page.goto('https://www.bromcomvle.com/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('🔐 Clicking Microsoft login button...');
    await page.waitForSelector('a[id="btnLinkMicrosoftAccount"]', { timeout: 10000 });
    await Promise.all([
      page.click('a[id="btnLinkMicrosoftAccount"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
    ]);

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
      const buttonText = await page.$eval('input[type="submit"][id="idSIButton9"]', el => el.value);
      if (buttonText === 'Yes' || buttonText === 'No') {
        await page.click('input[type="button"][id="idBtn_Back"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      }
    } catch (e) {
      console.log('ℹ️  No stay signed in prompt found, continuing...');
    }

    await page.waitForSelector('aside#sidebar-left', { timeout: 30000 });

    await page.waitForSelector('a[href="/Homework"]', { timeout: 10000 });
    await Promise.all([
      page.click('a[href="/Homework"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    const assignments = await page.evaluate(() => {
      const rows = document.querySelectorAll('#HomeworkTable tbody tr');
      const results: any[] = [];

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 10) return;

        const dueDateStr = cells[0]?.textContent?.trim() || '';
        let dueDate: number | undefined;
        if (dueDateStr) {
          const [day, month, year] = dueDateStr.split('/');
          const parsed = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(parsed.getTime())) {
            dueDate = parsed.getTime();
          }
        }

        const title = cells[2]?.textContent?.trim() || '';
        const subject = cells[4]?.textContent?.trim() || '';
        const teacher = cells[5]?.textContent?.trim() || '';
        const score = cells[6]?.textContent?.trim() || '';
        const status = cells[7]?.textContent?.trim() || '';
        const submissionType = cells[9]?.textContent?.trim() || '';

        let priority: 'low' | 'medium' | 'high' = 'medium';
        if (dueDate) {
          const daysUntilDue = (dueDate - Date.now()) / (1000 * 60 * 60 * 24);
          if (daysUntilDue < 0) priority = 'high';
          else if (daysUntilDue <= 2) priority = 'high';
          else if (daysUntilDue <= 7) priority = 'medium';
          else priority = 'low';
        }

        const editButton = row.querySelector('td.HomeworkViewEdit');
        const homeworkId = editButton?.getAttribute('data-id') || `${index}`;

        results.push({
          title,
          description: submissionType,
          subject,
          dueDate,
          priority,
          status,
          teacher,
          submissionType,
          score,
          externalId: `bromcom-${homeworkId}`,
        });
      });

      return results;
    }) as Assignment[];

    console.log(`✅ Found ${assignments.length} homework assignments`);

    return assignments;

  } catch (error) {
    console.error('❌ Error scraping Bromcom:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const email = process.env.BROMCOM_EMAIL;
  const password = process.env.BROMCOM_PASSWORD;

  if (!email || !password) {
    console.error('❌ Please set BROMCOM_EMAIL and BROMCOM_PASSWORD in .env.local');
    process.exit(1);
  }

  scrapeBromcom(email, password)
    .then(assignments => {
      console.log('\n📋 Homework Assignments:');
      console.log(JSON.stringify(assignments, null, 2));
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

