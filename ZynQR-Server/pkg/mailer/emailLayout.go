package mailer

import "fmt"

// emailCardWidth is the content column width (works well on phone and desktop clients).
const emailCardWidth = 600

func emailPageOpen(title, appName string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>%s — %s</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%%;ms-text-size-adjust:100%%;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="width:100%%;background-color:#eef2f6;">
    <tr>
      <td align="center" style="padding:32px 20px;">`, appName, title)
}

func emailPageClose() string {
	return `
      </td>
    </tr>
  </table>
</body>
</html>`
}

func emailCardOpen() string {
	return fmt.Sprintf(`
        <table role="presentation" width="%d" cellspacing="0" cellpadding="0" border="0" style="width:100%%;max-width:%dpx;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0d5d0;box-shadow:0 2px 8px rgba(22,28,31,0.06);">`,
		emailCardWidth, emailCardWidth)
}

func emailCardClose() string {
	return `        </table>`
}

func emailHeaderBlock(appName, subtitle string) string {
	return fmt.Sprintf(`
          <tr>
            <td style="background-color:#af3100;padding:22px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;line-height:1.25;color:#ffffff;">%s</p>
              <p style="margin:6px 0 0;font-size:14px;line-height:1.45;color:rgba(255,255,255,0.92);">%s</p>
            </td>
          </tr>`, appName, subtitle)
}

func emailBodyOpen() string {
	return `
          <tr>
            <td style="padding:28px 32px 20px;">`
}

func emailBodyClose() string {
	return `
            </td>
          </tr>`
}

func emailNoteBlock(note string) string {
	return fmt.Sprintf(`
          <tr>
            <td style="padding:0 32px 20px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:#8f7067;">%s</p>
            </td>
          </tr>`, note)
}

func emailFooterBlock(footerHTML string) string {
	return fmt.Sprintf(`
          <tr>
            <td style="padding:14px 32px;background-color:#f3f6f9;border-top:1px solid #ebe4e0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#5b4139;">%s</p>
            </td>
          </tr>`, footerHTML)
}
