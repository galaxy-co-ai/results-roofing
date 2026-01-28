#!/usr/bin/env python3
"""Generate a professional PDF for the credentials request."""

from fpdf import FPDF

class CredentialsPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font('Inter', '', 'C:/Windows/Fonts/arial.ttf', uni=True)
        self.add_font('Inter', 'B', 'C:/Windows/Fonts/arialbd.ttf', uni=True)

    def header(self):
        # Header background
        self.set_fill_color(30, 35, 41)  # Charcoal
        self.rect(0, 0, 210, 20, 'F')
        # Logo
        self.set_fill_color(30, 108, 255)  # Brand blue
        self.rect(10, 5, 10, 10, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Inter', 'B', 8)
        self.set_xy(12, 8)
        self.cell(6, 5, 'RR', align='C')
        # Brand name
        self.set_xy(22, 7)
        self.set_font('Inter', 'B', 10)
        self.cell(50, 6, 'Results Roofing')
        # Date
        self.set_xy(160, 7)
        self.set_text_color(107, 122, 148)
        self.set_font('Inter', '', 8)
        self.cell(40, 6, 'January 26, 2026', align='R')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Inter', '', 8)
        self.set_text_color(107, 122, 148)
        self.cell(0, 10, 'Questions? Contact us to schedule a call.', align='L')
        self.cell(0, 10, f'Page {self.page_no()}', align='R')

    def section_title(self, title, color=(30, 108, 255)):
        self.set_font('Inter', 'B', 12)
        self.set_text_color(*color)
        self.cell(0, 8, title, ln=True)
        self.ln(2)

    def body_text(self, text):
        self.set_font('Inter', '', 9)
        self.set_text_color(30, 35, 41)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def credential_card(self, num, name, tag, rows):
        # Card border
        y_start = self.get_y()
        self.set_draw_color(232, 237, 245)

        # Number badge
        self.set_fill_color(30, 108, 255)
        self.set_text_color(255, 255, 255)
        self.set_font('Inter', 'B', 9)
        self.ellipse(12, y_start + 2, 7, 7, 'F')
        self.set_xy(12, y_start + 3)
        self.cell(7, 5, str(num), align='C')

        # Title
        self.set_xy(22, y_start + 2)
        self.set_text_color(30, 35, 41)
        self.set_font('Inter', 'B', 11)
        self.cell(60, 7, name)

        # Tag
        self.set_fill_color(254, 242, 242)
        self.set_text_color(239, 68, 68)
        self.set_font('Inter', '', 8)
        tag_width = self.get_string_width(tag) + 6
        self.set_xy(190 - tag_width, y_start + 3)
        self.cell(tag_width, 5, tag, fill=True)

        self.ln(12)

        # Table rows
        for i, (label, value) in enumerate(rows):
            if i % 2 == 0:
                self.set_fill_color(247, 249, 252)
            else:
                self.set_fill_color(255, 255, 255)

            self.set_text_color(107, 122, 148)
            self.set_font('Inter', '', 8)
            self.cell(40, 7, label, fill=True)

            if 'API' in value or '_' in value:
                self.set_text_color(30, 108, 255)
            else:
                self.set_text_color(30, 35, 41)
            self.cell(0, 7, value, fill=True, ln=True)

        self.ln(5)

# Create PDF
pdf = CredentialsPDF()
pdf.add_page()

# Title
pdf.set_font('Inter', 'B', 18)
pdf.set_text_color(30, 35, 41)
pdf.cell(0, 10, 'Credentials & Access Request', ln=True)
pdf.set_font('Inter', '', 10)
pdf.set_text_color(107, 122, 148)
pdf.cell(0, 6, 'MVP B Development - Website Overhaul Project', ln=True)
pdf.ln(5)

# Divider
pdf.set_draw_color(232, 237, 245)
pdf.line(10, pdf.get_y(), 200, pdf.get_y())
pdf.ln(5)

# Overview
pdf.set_fill_color(239, 246, 255)
pdf.set_draw_color(30, 108, 255)
y = pdf.get_y()
pdf.rect(10, y, 190, 25, 'DF')
pdf.set_xy(15, y + 3)
pdf.set_font('Inter', 'B', 10)
pdf.set_text_color(30, 108, 255)
pdf.cell(0, 5, 'Overview', ln=True)
pdf.set_xy(15, y + 9)
pdf.set_font('Inter', '', 8)
pdf.set_text_color(30, 35, 41)
pdf.multi_cell(180, 4, 'The Results Roofing self-service quote platform is progressing well. We have completed the core infrastructure, quote flow, payment integration, and customer portal. However, several features are blocked pending access to third-party services.')
pdf.ln(8)

# Critical Section
pdf.set_fill_color(239, 68, 68)
pdf.ellipse(10, pdf.get_y() + 1, 3, 3, 'F')
pdf.set_xy(15, pdf.get_y())
pdf.set_font('Inter', 'B', 12)
pdf.set_text_color(30, 35, 41)
pdf.cell(0, 6, 'Critical - Required for MVP Launch', ln=True)
pdf.set_font('Inter', '', 9)
pdf.set_text_color(107, 122, 148)
pdf.cell(0, 5, 'These credentials are blocking core features that customers will use.', ln=True)
pdf.ln(5)

# Credential cards
credentials = [
    (1, 'Roofr', 'Satellite Measurements', [
        ('What we need', 'API Key'),
        ('Environment variable', 'ROOFR_API_KEY'),
        ('Why it is needed', 'Enables live satellite roof measurements'),
        ('Sign up', 'https://roofr.com'),
    ]),
    (2, 'JobNimbus', 'CRM Integration', [
        ('What we need', 'API Key'),
        ('Environment variable', 'JOBNIMBUS_API_KEY'),
        ('Why it is needed', 'Syncs leads and jobs to your CRM'),
        ('Sign up', 'Contact your JobNimbus rep'),
    ]),
    (3, 'Documenso', 'E-Signatures', [
        ('What we need', 'API Key'),
        ('Environment variable', 'DOCUMENSO_API_KEY'),
        ('Why it is needed', 'Allows customers to e-sign contracts'),
        ('Sign up', 'https://documenso.com'),
    ]),
    (4, 'Cal.com', 'Scheduling', [
        ('What we need', 'API Key + Event Type ID'),
        ('Environment variables', 'CALCOM_API_KEY, CALCOM_EVENT_TYPE_ID'),
        ('Why it is needed', 'Lets customers book appointments'),
        ('Sign up', 'https://cal.com'),
    ]),
    (5, 'Wisetack', 'Financing', [
        ('What we need', 'Merchant ID + API Key'),
        ('Environment variables', 'WISETACK_MERCHANT_ID, WISETACK_API_KEY'),
        ('Why it is needed', 'Enables customer financing'),
        ('Sign up', 'https://wisetack.com (merchant partnership)'),
    ]),
]

for cred in credentials:
    pdf.credential_card(*cred)

# New page for remaining sections
pdf.add_page()

# Analytics Section
pdf.set_fill_color(245, 158, 11)
pdf.ellipse(10, pdf.get_y() + 1, 3, 3, 'F')
pdf.set_xy(15, pdf.get_y())
pdf.section_title('Analytics & Tracking', (30, 35, 41))

analytics = [
    ('Google Analytics 4', 'GA4_MEASUREMENT_ID, GA4_API_SECRET', 'Production analytics'),
    ('Google Tag Manager', 'GTM_CONTAINER_ID', 'Tag management'),
    ('Meta/Facebook', 'META_PIXEL_ID, META_CAPI_TOKEN', 'Ad conversion tracking'),
]

# Table header
pdf.set_fill_color(247, 249, 252)
pdf.set_font('Inter', 'B', 8)
pdf.set_text_color(107, 122, 148)
pdf.cell(50, 7, 'Service', fill=True)
pdf.cell(80, 7, 'Credentials Needed', fill=True)
pdf.cell(0, 7, 'Purpose', fill=True, ln=True)

for i, (service, creds, purpose) in enumerate(analytics):
    if i % 2 == 0:
        pdf.set_fill_color(255, 255, 255)
    else:
        pdf.set_fill_color(247, 249, 252)
    pdf.set_font('Inter', 'B', 8)
    pdf.set_text_color(30, 35, 41)
    pdf.cell(50, 7, service, fill=True)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(30, 108, 255)
    pdf.cell(80, 7, creds, fill=True)
    pdf.set_text_color(107, 122, 148)
    pdf.cell(0, 7, purpose, fill=True, ln=True)

pdf.ln(8)

# Communications Section
pdf.set_fill_color(16, 185, 129)
pdf.ellipse(10, pdf.get_y() + 1, 3, 3, 'F')
pdf.set_xy(15, pdf.get_y())
pdf.section_title('Communications', (30, 35, 41))

comms = [
    ('SignalWire', 'SIGNALWIRE_PROJECT_ID, API_TOKEN, SPACE_URL', 'SMS notifications'),
    ('Resend', 'RESEND_API_KEY', 'Email delivery'),
]

pdf.set_fill_color(247, 249, 252)
pdf.set_font('Inter', 'B', 8)
pdf.set_text_color(107, 122, 148)
pdf.cell(50, 7, 'Service', fill=True)
pdf.cell(80, 7, 'Credentials Needed', fill=True)
pdf.cell(0, 7, 'Purpose', fill=True, ln=True)

for i, (service, creds, purpose) in enumerate(comms):
    if i % 2 == 0:
        pdf.set_fill_color(255, 255, 255)
    else:
        pdf.set_fill_color(247, 249, 252)
    pdf.set_font('Inter', 'B', 8)
    pdf.set_text_color(30, 35, 41)
    pdf.cell(50, 7, service, fill=True)
    pdf.set_font('Inter', '', 8)
    pdf.set_text_color(30, 108, 255)
    pdf.cell(80, 7, creds, fill=True)
    pdf.set_text_color(107, 122, 148)
    pdf.cell(0, 7, purpose, fill=True, ln=True)

pdf.ln(8)

# Security Warning
pdf.set_fill_color(254, 242, 242)
pdf.set_draw_color(254, 202, 202)
y = pdf.get_y()
pdf.rect(10, y, 190, 28, 'DF')
pdf.set_xy(15, y + 3)
pdf.set_font('Inter', 'B', 10)
pdf.set_text_color(239, 68, 68)
pdf.cell(0, 5, 'How to Send Credentials Securely', ln=True)
pdf.set_xy(15, y + 9)
pdf.set_font('Inter', '', 8)
pdf.set_text_color(30, 35, 41)
pdf.cell(0, 4, 'Do NOT send credentials via regular email. Please use:', ln=True)
pdf.set_xy(20, y + 14)
pdf.set_text_color(107, 122, 148)
pdf.cell(0, 4, '- 1Password / LastPass - Share via secure vault', ln=True)
pdf.set_xy(20, y + 18)
pdf.cell(0, 4, '- Encrypted email - Use ProtonMail or similar', ln=True)
pdf.set_xy(20, y + 22)
pdf.cell(0, 4, '- Secure document - Password-protected PDF', ln=True)

pdf.ln(15)

# Priority Order
pdf.section_title('Recommended Priority Order', (30, 35, 41))
pdf.set_font('Inter', '', 9)
pdf.set_text_color(107, 122, 148)
pdf.cell(0, 5, 'If you need to set these up in phases:', ln=True)
pdf.ln(3)

phases = [
    ('Phase 1', 'Core Quote Flow', ['1. Roofr', '2. Clerk', '3. Google Places']),
    ('Phase 2', 'Transactions', ['4. Documenso', '5. Cal.com', '6. Wisetack']),
    ('Phase 3', 'Operations', ['7. JobNimbus', '8. SignalWire', '9. GA4 + GTM']),
]

x_start = 15
for phase_num, phase_name, items in phases:
    pdf.set_xy(x_start, pdf.get_y())
    pdf.set_fill_color(247, 249, 252)
    pdf.rect(x_start - 5, pdf.get_y(), 58, 30, 'F')

    # Badge
    pdf.set_fill_color(30, 108, 255)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Inter', 'B', 7)
    pdf.set_xy(x_start, pdf.get_y() + 3)
    pdf.cell(20, 4, phase_num, fill=True)

    # Title
    pdf.set_xy(x_start + 22, pdf.get_y() - 4)
    pdf.set_text_color(30, 35, 41)
    pdf.set_font('Inter', 'B', 8)
    pdf.cell(30, 5, phase_name)

    # Items
    pdf.set_font('Inter', '', 7)
    pdf.set_text_color(107, 122, 148)
    y_items = pdf.get_y() + 6
    for item in items:
        pdf.set_xy(x_start, y_items)
        pdf.cell(50, 4, item)
        y_items += 4

    x_start += 63

# Save
pdf.output('docs/client-credentials-request.pdf')
print('PDF created: docs/client-credentials-request.pdf')
