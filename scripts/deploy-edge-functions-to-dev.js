import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FUNCTIONS_DIR = join(__dirname, '../supabase/functions')

async function main() {
  try {
    console.log('📦 Preparing Edge Functions for deployment to DEV...\n')
    
    const functions = ['ai-generate', 'generate-simulation', 'create-simulation']
    const functionFiles = {}
    
    // Read all function files
    for (const funcName of functions) {
      const funcPath = join(FUNCTIONS_DIR, funcName, 'index.ts')
      try {
        const content = await readFile(funcPath, 'utf-8')
        functionFiles[funcName] = content
        console.log(`   ✅ Found: ${funcName}/index.ts`)
      } catch (error) {
        console.log(`   ⚠️  Missing: ${funcName}/index.ts (will skip)`)
      }
    }
    
    console.log('\n📝 To deploy Edge Functions to DEV:')
    console.log('   1. Make sure you have Supabase CLI installed: npm install -g supabase')
    console.log('   2. Link to dev project:')
    console.log('      supabase link --project-ref qwhzvupmyjabkgbmvoxo')
    console.log('   3. Deploy each function:')
    
    for (const funcName of Object.keys(functionFiles)) {
      console.log(`      supabase functions deploy ${funcName}`)
    }
    
    console.log('\n   Or use the Supabase Dashboard:')
    console.log('   https://supabase.com/dashboard/project/qwhzvupmyjabkgbmvoxo/functions')
    console.log('   (Upload each function manually)\n')
    
    console.log('📋 Functions ready to deploy:')
    Object.keys(functionFiles).forEach(name => {
      console.log(`   • ${name}`)
    })
    
    console.log('\n💡 Note: Make sure to set secrets in dev project:')
    console.log('   - GEMINI_API_KEY (for ai-generate and generate-simulation)')
    console.log('   - LLM_API_KEY (for create-simulation)')
    console.log('   - LLM_API_URL (for create-simulation)')
    console.log('   - SUPABASE_ANON_KEY (for create-simulation)')
    console.log('   https://supabase.com/dashboard/project/qwhzvupmyjabkgbmvoxo/settings/secrets\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()



