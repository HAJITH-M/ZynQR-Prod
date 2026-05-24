package mailer

import (
	"fmt"
	"html"
	"strings"
)

func buildContactInquiryHTML(brand emailBrand, senderName, senderEmail, topicLabel, message string) string {
	name := html.EscapeString(brand.AppName)
	safeSender := html.EscapeString(strings.TrimSpace(senderName))
	safeEmail := html.EscapeString(strings.TrimSpace(senderEmail))
	safeTopic := html.EscapeString(strings.TrimSpace(topicLabel))
	safeMessage := html.EscapeString(strings.TrimSpace(message))
	safeMessage = strings.ReplaceAll(safeMessage, "\n", "<br/>")

	footerExtra := fmt.Sprintf("Sent via the %s contact form.", name)
	if u := strings.TrimSpace(brand.PublicURL); u != "" {
		safeURL := html.EscapeString(strings.TrimRight(u, "/"))
		footerExtra = fmt.Sprintf(`Sent via <a href="%s" style="color:#af3100;text-decoration:none;">%s</a> contact form.`, safeURL, name)
	}

	details := fmt.Sprintf(`
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e8e0db;border-radius:10px;">
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #ebe4e0;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="88" valign="top" style="padding:0 16px 0 0;font-size:11px;font-weight:700;line-height:1.5;color:#8f7067;text-transform:uppercase;letter-spacing:0.06em;">Topic</td>
                        <td valign="top" style="font-size:15px;font-weight:600;line-height:1.5;color:#161c1f;">%s</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #ebe4e0;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="88" valign="top" style="padding:0 16px 0 0;font-size:11px;font-weight:700;line-height:1.5;color:#8f7067;text-transform:uppercase;letter-spacing:0.06em;">From</td>
                        <td valign="top" style="font-size:15px;font-weight:600;line-height:1.5;color:#161c1f;">%s</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #ebe4e0;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="88" valign="top" style="padding:0 16px 0 0;font-size:11px;font-weight:700;line-height:1.5;color:#8f7067;text-transform:uppercase;letter-spacing:0.06em;">Email</td>
                        <td valign="top" style="font-size:15px;line-height:1.5;"><a href="mailto:%s" style="color:#af3100;font-weight:600;text-decoration:none;">%s</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="88" valign="top" style="padding:0 16px 8px 0;font-size:11px;font-weight:700;line-height:1.5;color:#8f7067;text-transform:uppercase;letter-spacing:0.06em;">Message</td>
                        <td valign="top" style="font-size:15px;line-height:1.6;color:#161c1f;">%s</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>`,
		safeTopic, safeSender, safeEmail, safeEmail, safeMessage,
	)

	return emailPageOpen("Contact", name) +
		emailCardOpen() +
		emailHeaderBlock(name, fmt.Sprintf("New contact · %s", safeTopic)) +
		emailBodyOpen() +
		details +
		emailBodyClose() +
		emailNoteBlock("Reply in your mail app to reach the sender directly.") +
		emailFooterBlock(footerExtra) +
		emailCardClose() +
		emailPageClose()
}
