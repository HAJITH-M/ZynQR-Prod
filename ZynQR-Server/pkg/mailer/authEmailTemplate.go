package mailer

import (
	"fmt"
	"html"
	"strings"
)

func buildAuthEmailShell(brand emailBrand, pageTitle, headerSubtitle, mainHTML, footerNote string) string {
	name := html.EscapeString(strings.TrimSpace(brand.AppName))
	safeTitle := html.EscapeString(pageTitle)
	safeSubtitle := html.EscapeString(headerSubtitle)
	safeFooterNote := html.EscapeString(footerNote)
	footerLink := brand.footerLine()

	return emailPageOpen(safeTitle, name) +
		emailCardOpen() +
		emailHeaderBlock(name, safeSubtitle) +
		emailBodyOpen() +
		mainHTML +
		emailBodyClose() +
		emailNoteBlock(safeFooterNote) +
		emailFooterBlock(footerLink) +
		emailCardClose() +
		emailPageClose()
}

func buildEmailVerificationHTML(brand emailBrand, displayName, verifyLink string) string {
	safeName := html.EscapeString(strings.TrimSpace(displayName))
	if safeName == "" {
		safeName = "there"
	}
	safeLink := html.EscapeString(strings.TrimSpace(verifyLink))

	main := fmt.Sprintf(`
              <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#161c1f;">Hi %s,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#161c1f;">Thanks for signing up. Confirm your email address to activate your account.</p>
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:10px;background-color:#af3100;">
                          <a href="%s" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Verify email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:#8f7067;">If the button does not work, use this link:</p>
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e8e0db;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <a href="%s" style="font-size:14px;font-weight:600;line-height:1.5;color:#af3100;text-decoration:none;">Verify your email address</a>
                  </td>
                </tr>
              </table>`,
		safeName, safeLink, safeLink,
	)

	return buildAuthEmailShell(
		brand,
		"Verify email",
		"Verify your email · Account setup",
		main,
		"This link expires in 24 hours. If you did not create an account, you can ignore this email.",
	)
}

func buildOtpCodeBlock(otp string) string {
	safeOTP := html.EscapeString(strings.TrimSpace(otp))
	return fmt.Sprintf(`
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;background-color:#f8fafc;border:1px solid #e8e0db;border-radius:10px;">
                <tr>
                  <td align="center" style="padding:24px 20px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;line-height:1.5;color:#8f7067;text-transform:uppercase;letter-spacing:0.1em;">Your code</p>
                    <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:0.22em;line-height:1.2;color:#161c1f;font-family:ui-monospace,'Cascadia Code','Segoe UI Mono',monospace;">%s</p>
                  </td>
                </tr>
              </table>`, safeOTP)
}

func buildPasswordResetOTPHTML(brand emailBrand, otp string) string {
	main := fmt.Sprintf(`
              <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#161c1f;">Hello,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#161c1f;">Use this one-time code to reset your password:</p>
              %s
              <p style="margin:0;font-size:14px;line-height:1.5;color:#8f7067;">The code expires in 5 minutes.</p>`,
		buildOtpCodeBlock(otp),
	)

	return buildAuthEmailShell(
		brand,
		"Password reset",
		"Password reset · Security",
		main,
		"If you did not request a password reset, ignore this email. Your password will stay the same.",
	)
}

func buildLogin2FAOTPHTML(brand emailBrand, otp string) string {
	main := fmt.Sprintf(`
              <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#161c1f;">Hello,</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#161c1f;">Enter this code to finish signing in:</p>
              %s
              <p style="margin:0;font-size:14px;line-height:1.5;color:#8f7067;">The code expires in 5 minutes.</p>`,
		buildOtpCodeBlock(otp),
	)

	return buildAuthEmailShell(
		brand,
		"Sign-in code",
		"Sign-in verification · Two-factor",
		main,
		"If you did not try to sign in, change your password and review your security settings.",
	)
}
