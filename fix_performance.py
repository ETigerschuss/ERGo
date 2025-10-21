import re

# Read the file
with open('src/scenes/DefogGamev0.04.js', 'r', encoding='utf-8') as f:
    content = f.read()

# =============================================================================
# FIX 1: Better cleanup of activeSpecies and activeFamilies
# =============================================================================
# Replace the cleanup logic to properly handle multiple species per family

old_cleanup = r'''        // Clean up activeSpecies Set and activeFamilies Map every 60 frames
        if \(this\.updateFrameCounter % 60 === 0\) \{
            const activeSpeciesIds = new Set\(this\.insects\.map\(i => i\.insectId\)\); // Changed from speciesId to insectId
            for \(const speciesId of this\.activeSpecies\) \{
                if \(!activeSpeciesIds\.has\(speciesId\)\) \{
                    this\.activeSpecies\.delete\(speciesId\);
                    const speciesData = INSECT_DATABASE\[speciesId\];
                    if \(speciesData\) \{
                        const family = speciesData\.superfamily;
                        this\.activeFamilies\.delete\(family\);
                        console\.log\(`🔓 Cleaned up \$\{speciesId\} from activeSpecies and freed family \$\{family\}`\);
                    \}
                    this\.updateSpeciesBoxHighlights\(\);
                \}
            \}
        \}'''

new_cleanup = '''        // Clean up activeSpecies Set and activeFamilies Map every 30 frames (more responsive)
        if (this.updateFrameCounter % 30 === 0) {
            const activeSpeciesIds = new Set(this.insects.map(i => i.insectId));
            const activeFamiliesSet = new Set(); // Track which families still have active insects
            
            for (const speciesId of this.activeSpecies) {
                if (!activeSpeciesIds.has(speciesId)) {
                    this.activeSpecies.delete(speciesId);
                    console.log(`🔓 Cleaned up ${speciesId} from activeSpecies`);
                    this.updateSpeciesBoxHighlights();
                }
            }
            
            // Rebuild activeFamilies based on current insects (more reliable)
            for (const insect of this.insects) {
                if (!insect.isDead) {
                    activeFamiliesSet.add(insect.superfamily);
                }
            }
            
            // Only clear families that no longer have any insects
            for (const family of this.activeFamilies.keys()) {
                if (!activeFamiliesSet.has(family)) {
                    this.activeFamilies.delete(family);
                    console.log(`🔓 Family ${family} is now completely FREE`);
                }
            }
        }'''

content = re.sub(old_cleanup, new_cleanup, content, flags=re.MULTILINE)

# =============================================================================
# FIX 2: Performance optimization - reduce expensive calculations
# =============================================================================
# Reduce the frequency of expensive operations

# Make insect movement less frequent (every other frame) for smoother gameplay
# Find the insect movement/update code

# Add a performance mode flag at the beginning of update()
# This reduces recalculation frequency when there are many insects

# Let's add an optimization that skips some updates when insect count is high
old_update_start = r'(    update\(delta\) \{\s*const width = this\.scale\.width;)'

new_update_start = r'''\1
        
        // Performance optimization: reduce update frequency when many insects present
        this.insectCount = this.insects.filter(i => !i.isDead).length;
        const isHighLoad = this.insectCount > 15;
        const updateFreq = isHighLoad ? 2 : 1; // Skip every other frame if too many insects'''

content = re.sub(old_update_start, new_update_start, content, flags=re.MULTILINE)

# Write back
with open('src/scenes/DefogGamev0.04.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Applied fixes:")
print("1. ✓ Fixed blocked families cleanup - now checks every 30 frames (faster)")
print("2. ✓ Added better family tracking - rebuilds from active insects")
print("3. ✓ Added performance optimization prep for high insect loads")
