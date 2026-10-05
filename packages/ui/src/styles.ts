/** M² Lab material palette: 60 porcelain, 30 graphite, 10 copper. */
export const creativeLabStyles = `
:root{
  --cl-porcelain:#F8F7F4;
  --cl-paper:#FFFCF8;
  --cl-graphite:#1C1C1C;
  --cl-gunmetal:#3A3A3A;
  --cl-copper:#B87333;
  --cl-ink:#1C1C1C;
  --cl-muted:#6E6A62;
  --cl-line:#E4E0D8;
  --cl-danger:#8C3A2F;
  font-family:"Avenir Next","Segoe UI",sans-serif;
  color:var(--cl-ink);
  background:var(--cl-porcelain);
}
*{box-sizing:border-box}
body{margin:0;background:var(--cl-porcelain);color:var(--cl-ink)}
.cl-shell{min-height:100vh;display:grid;grid-template-columns:240px 1fr;background:var(--cl-porcelain)}
.cl-side{position:sticky;top:0;height:100vh;background:var(--cl-graphite);color:#F8F7F4;padding:28px 18px;display:flex;flex-direction:column;gap:28px}
.cl-side-head{display:contents}
.cl-brand{font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:650}
.cl-nav{display:grid;gap:4px}
.cl-nav a,.cl-nav button{color:#D9D4CC;text-decoration:none;background:transparent;border:0;text-align:left;font:inherit;padding:11px 12px;border-radius:8px;cursor:pointer}
.cl-nav a:hover,.cl-nav button:hover,.cl-nav a[aria-current="page"]{background:var(--cl-gunmetal);color:#fff}
.cl-account{margin-top:auto;display:grid;gap:10px;padding-top:24px;border-top:1px solid #333}
.cl-account p{margin:0;font-size:14px;line-height:1.3}
.cl-account form{display:grid;gap:10px}
.cl-account a,.cl-account button{height:36px;border:1px solid #4A4A4A;border-radius:8px;background:transparent;color:#F8F7F4;font:inherit;font-size:13px;font-weight:600;padding:0 12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.cl-account a:hover,.cl-account button:hover{background:#2A2A2A}
.cl-main{padding:40px 32px 64px;min-width:0}
.cl-kicker{margin:0 0 8px;font-size:11px;letter-spacing:.16em;color:var(--cl-copper);text-transform:uppercase}
.cl-main h1{margin:0 0 28px;font-size:40px;line-height:1.05;font-weight:600;letter-spacing:-.02em}
.cl-main article,.cl-card{background:var(--cl-paper);border:1px solid var(--cl-line);border-radius:16px;padding:24px;max-width:720px;margin-bottom:16px}
.cl-card h2,.cl-main article h2{margin:0 0 16px;font-size:22px;font-weight:600}
.cl-card p,.cl-main article p{color:var(--cl-muted);line-height:1.5}
.cl-card a{color:var(--cl-ink);font-weight:600}
.cl-card ul,.cl-main article ul{padding-left:18px}
.cl-field{display:grid;gap:6px;margin-bottom:14px;font-size:14px;color:var(--cl-ink)}
.cl-field input{width:100%;height:46px;border:1px solid var(--cl-line);border-radius:10px;padding:0 12px;background:#fff;font:inherit;color:var(--cl-ink)}
.cl-field input:focus{outline:2px solid var(--cl-copper);border-color:transparent}
.cl-button{height:44px;border:0;border-radius:10px;padding:0 16px;background:var(--cl-graphite);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.cl-button:disabled{opacity:.6}
.cl-alert{color:var(--cl-danger);margin:8px 0}
dl{display:grid;grid-template-columns:120px 1fr;gap:8px 12px;margin:16px 0}
dt{color:var(--cl-muted)}
dd{margin:0}
@media(max-width:800px){
  .cl-shell{grid-template-columns:1fr}
  .cl-side{position:sticky;top:0;z-index:20;height:auto;padding:16px 16px 12px;gap:14px;border-bottom:1px solid #2A2A2A}
  .cl-side-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .cl-nav{grid-auto-flow:column;grid-auto-columns:max-content;overflow:auto;gap:6px}
  .cl-nav a{white-space:nowrap}
  .cl-account{margin-top:0;border-top:0;padding-top:0}
  .cl-account form{display:flex;align-items:center;gap:10px}
  .cl-account p{font-size:13px;max-width:42vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cl-main{padding:24px 16px 48px}
  .cl-main h1{font-size:32px}
}
.auth-landing{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--cl-porcelain)}
.auth-landing__card{width:min(100%,480px);background:var(--cl-paper);border:1px solid var(--cl-line);border-radius:20px;padding:40px 32px;text-align:center}
.auth-landing__brand{letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:var(--cl-copper)}
.auth-landing__description{color:var(--cl-muted);line-height:1.5}
.auth-landing__actions{display:grid;gap:10px;margin-top:28px}
.auth-landing__actions a{display:block;padding:13px 16px;border-radius:10px;text-decoration:none;font-weight:600}
.auth-landing__primary{background:var(--cl-graphite);color:#fff}
.auth-landing__secondary{border:1px solid var(--cl-line);color:var(--cl-ink)}
`;
