import re

with open('src/components/LandingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Theme replacements
content = content.replace('bg-emerald-600 text-white', 'bg-yellow-400 text-stone-900')
content = content.replace('text-emerald-600', 'text-yellow-600')
content = content.replace('bg-emerald-50 text-emerald-700', 'bg-yellow-50 text-yellow-700')
content = content.replace('hover:text-emerald-600', 'hover:text-yellow-600')
content = content.replace('hover:bg-emerald-700', 'hover:bg-yellow-500')
content = content.replace('shadow-emerald-200', 'shadow-yellow-200')
content = content.replace('from-emerald-50 via-white to-amber-50', 'from-yellow-50 via-white to-stone-50')
content = content.replace('from-emerald-600 to-amber-600', 'from-yellow-500 to-amber-500')
content = content.replace('hover:border-emerald-200', 'hover:border-yellow-300')
content = content.replace('bg-emerald-200/40', 'bg-yellow-200/40')
content = content.replace('text-emerald-700', 'text-yellow-700')
content = content.replace('border-emerald-100', 'border-yellow-200')
content = content.replace('shadow-emerald-100', 'shadow-yellow-100')
content = content.replace('shadow-emerald-900', 'shadow-yellow-900')
content = content.replace('bg-emerald-100 text-emerald-700', 'bg-yellow-100 text-yellow-800')
content = content.replace('bg-emerald-50', 'bg-yellow-50')

# Remove Pricing nav links
content = re.sub(r'<a href=\"#pricing\"[^>]*>Pricing</a>\n\s*', '', content)
content = re.sub(r'\[\'#pricing\', \'Pricing\'\],\n\s*', '', content)

# Remove Pricing section completely
pricing_start = content.find('{/* PRICING */}')
faq_start = content.find('{/* FAQ */}')
if pricing_start != -1 and faq_start != -1:
    content = content[:pricing_start] + content[faq_start:]

# Replace right side hero with animated image
hero_right_pattern = r'\{/\* HERO DASHBOARD PREVIEW \*/\}(.*?)\{/\* QUICK VALUE \*/\}'
new_hero_right = '''{/* HERO RIGHT IMAGE */}
            <div className=\"relative flex justify-center lg:justify-end\">
              <style>{
                @keyframes float-animation {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float-hero {
                  animation: float-animation 6s ease-in-out infinite;
                }
              }</style>
              <img 
                src=\"/hero-illustration.jpg\" 
                alt=\"Animated Hero Illustration\" 
                className=\"w-full max-w-[550px] object-contain mix-blend-multiply animate-float-hero rounded-3xl\"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VALUE */}'''
content = re.sub(hero_right_pattern, new_hero_right, content, flags=re.DOTALL)

with open('src/components/LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
