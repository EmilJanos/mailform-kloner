// Bruger: node tools/import.js ole/index.html ole "Mailform Ole"
// Laver seed/<slug>.sql ud fra en statisk kopi. Formularen erstattes af en plads, som visningen bygger.
const { chromium } = require("playwright");
const fs = require("fs");
const [file, slug, title = slug] = process.argv.slice(2);
if (!file || !slug) { console.error("node tools/import.js <fil> <slug> [titel]"); process.exit(1); }
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.setContent(fs.readFileSync(file, "utf8"));
  const out = await pg.evaluate(() => {
    const legend = document.querySelector(".contactform__legend")?.textContent.trim() || "";
    document.querySelectorAll(".contactform").forEach((c) => {
      c.outerHTML = '<div data-mf-form></div>';
    });
    const zone = document.querySelector("section.bk-zone");
    const sections = [...zone.children].map((el, i) => {
      const ph = el.querySelector(".ole-placeholder");
      return { id: "s" + (i + 1), kind: ph && el.textContent.trim() === ph.textContent.trim() ? "placeholder" : "html",
               html: ph && el.textContent.trim() === ph.textContent.trim() ? "" : el.outerHTML };
    });
    // Pladsholdere der står midt i en blok bliver i blokken som tom ramme (kan redigeres som HTML).
    return { legend, sections };
  });
  await b.close();
  const q = (s) => "'" + s.replace(/'/g, "''") + "'";
  fs.mkdirSync("seed", { recursive: true });
  const sql = `-- Skabelon/side "${slug}". Kør EFTER 0001_init.sql.\n` +
    `insert into public.pages (slug,title,legend,sections,published,is_template) values (` +
    `${q(slug)},${q(title)},${q(out.legend)},${q(JSON.stringify(out.sections))}::jsonb,true,false)\n` +
    `on conflict (slug) do update set sections=excluded.sections, legend=excluded.legend, title=excluded.title;\n`;
  fs.writeFileSync(`seed/${slug}.sql`, sql);
  fs.writeFileSync(`seed/${slug}.json`, JSON.stringify(out, null, 1));
  console.log(slug, out.sections.length, "sektioner, legend:", out.legend);
})();
