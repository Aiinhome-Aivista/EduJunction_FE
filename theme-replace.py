import os

src_dir = os.path.join(os.path.dirname(__file__), 'src')

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # Theme replacements
    new_content = new_content.replace('indigo-', 'emerald-')
    new_content = new_content.replace('slate-', 'stone-')
    new_content = new_content.replace('purple-', 'amber-')
    new_content = new_content.replace('blue-', 'teal-')
    new_content = new_content.replace('bg-[#f3f5f9]', 'bg-stone-50')
    new_content = new_content.replace('bg-[#0a0a0e]', 'bg-[#1c1917]') # stone-900ish

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

def traverse_dir(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                replace_in_file(os.path.join(root, file))

traverse_dir(src_dir)
print("Done.")
