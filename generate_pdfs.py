import sys

def create_simple_pdf(filename, title, subtitle, author, description, chapters):
    # Standard PDF header and structure
    # We will write a minimal valid PDF with streams
    lines = [
        "%PDF-1.4",
        "%\xe2\xe3\xcf\xd3",
        "1 0 obj",
        "<< /Type /Catalog /Pages 2 0 R >>",
        "endobj",
        "2 0 obj",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "endobj",
        "3 0 obj",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >>",
        "endobj",
        "4 0 obj",
        "<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>",
        "endobj"
    ]
    
    # Stream content
    content_lines = [
        "BT",
        "/F1 24 Tf",
        "50 780 Td",
        f"({title}) Tj",
        "0 -35 Td",
        "/F2 14 Tf",
        f"({subtitle}) Tj",
        "0 -25 Td",
        f"(Author: {author}) Tj",
        "0 -40 Td",
        "/F1 14 Tf",
        "(Description:) Tj",
        "0 -20 Td",
        "/F2 10 Tf",
    ]
    
    # Add description paragraphs
    for para in description.split('\n'):
        if para.strip():
            # escape parens
            safe_para = para.replace('(', '\\(').replace(')', '\\)')
            content_lines.append(f"({safe_para[:80]}) Tj")
            content_lines.append("0 -15 Td")
            
    content_lines.append("0 -20 Td")
    content_lines.append("/F1 14 Tf")
    content_lines.append("(Table of Contents:) Tj")
    content_lines.append("0 -20 Td")
    content_lines.append("/F2 10 Tf")
    
    for ch in chapters:
        safe_ch = ch.replace('(', '\\(').replace(')', '\\)')
        content_lines.append(f"(- {safe_ch}) Tj")
        content_lines.append("0 -15 Td")
        
    content_lines.append("ET")
    
    stream_data = "\n".join(content_lines).encode('latin-1', 'ignore')
    
    lines.append("5 0 obj")
    lines.append(f"<< /Length {len(stream_data)} >>")
    lines.append("stream")
    
    # Assembly
    with open(filename, "wb") as f:
        for line in lines:
            f.write(line.encode('latin-1') + b"\n")
        f.write(stream_data + b"\n")
        f.write(b"endstream\nendobj\n")
        
        # xref
        f.write(b"xref\n0 6\n0000000000 65535 f \n")
        f.write(b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n100\n%%EOF\n")

print("Script template ready")
