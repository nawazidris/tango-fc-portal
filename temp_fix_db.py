from pathlib import Path
p = Path("src/server/db.json")
data = p.read_text(encoding="utf-8", errors="replace")
data = data.replace("}\n    {", "},\n    {")
p.write_text(data, encoding="utf-8")
print("fixed")
