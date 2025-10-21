import re

# Read the file
with open('src/scenes/DefogGamev0.04.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the showHighscores function and replace it completely
# We'll find it and replace from "async showHighscores()" to before "// LOCALSTORAGE SCORE SAVING"

start_marker = "    async showHighscores() {"
end_marker = "    // LOCALSTORAGE SCORE SAVING"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERROR: Could not find markers")
    exit(1)

new_function = '''    async showHighscores() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // First, prompt for player name if not set
        let playerName = localStorage.getItem('playerName') || '';
        
        if (!playerName) {
            // Show name input dialog
            playerName = await this.showNameInputDialog();
            if (playerName) {
                localStorage.setItem('playerName', playerName);
            } else {
                playerName = 'Anonymous'; // Default if user cancels
                localStorage.setItem('playerName', playerName);
            }
        }
        
        // Create overlay
        const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.95)
            .setOrigin(0).setDepth(11000).setScrollFactor(0).setInteractive();
        
        // Title
        const usingFirebase = window.firebaseInitialized;
        const titleText = usingFirebase ? '🎯 GLOBAL LEADERBOARD 🌐' : '🏆 YOUR BEST SCORES 🏆';
        const title = this.add.text(width / 2, 40, titleText, {
            fontSize: '36px',
            color: '#ffaa00',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Show player name
        const playerNameText = this.add.text(width / 2, 70, `Player: ${playerName}`, {
            fontSize: '16px',
            color: '#88ff88',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Loading message
        const loadingText = this.add.text(width / 2, height / 2, 'Loading scores...', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11001).setScrollFactor(0);
        
        // Load global scores for all 5 levels
        const allLevelScores = {};
        if (usingFirebase) {
            try {
                for (let level = 1; level <= 5; level++) {
                    allLevelScores[level] = await this.loadGlobalLeaderboard(level);
                }
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            }
        }
        
        // Remove loading text
        loadingText.destroy();
        
        // Display top 3 per level, plus player position if not in top 3
        let startY = 115;
        const levelSpacing = 110;
        
        for (let level = 1; level <= 5; level++) {
            const yPos = startY + ((level - 1) * levelSpacing);
            
            // Level header
            this.add.text(width / 2 - 380, yPos, `Level ${level}`, {
                fontSize: '24px',
                color: '#ffdd00',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0, 0).setDepth(11001).setScrollFactor(0);
            
            // Get scores for this level - merge local + global
            let allScores = [];
            
            // Get local score
            const localScore = this.highScores.levels[level];
            let playerScore = null;
            
            if (localScore) {
                playerScore = {
                    time: localScore.time,
                    diamonds: localScore.diamonds,
                    playerName: playerName,
                    isLocal: true
                };
            }
            
            // Get global scores (if Firebase is available)
            if (usingFirebase && allLevelScores[level]) {
                const globalScores = allLevelScores[level].map(s => ({
                    time: s.time,
                    diamonds: s.diamonds,
                    playerName: s.playerName || 'Anonymous',
                    isLocal: false
                }));
                allScores = globalScores;
            }
            
            if (playerScore) {
                // Sort all scores by time to find player's rank
                allScores.sort((a, b) => a.time - b.time);
                
                // Find player rank (1-indexed)
                let playerRank = allScores.findIndex(s => 
                    s.playerName === playerName && s.time === playerScore.time
                ) + 1;
                
                if (playerRank === 0) {
                    // Player score not in global list, so add at the end
                    playerRank = allScores.length + 1;
                }
                
                // Display top 3 scores
                const topScores = allScores.slice(0, 3);
                topScores.forEach((score, index) => {
                    const scoreY = yPos + 28 + (index * 12);
                    const timeStr = this.formatTime(score.time);
                    const rank = index + 1;
                    const rankColor = index === 0 ? '#ffdd00' : (index === 1 ? '#dddddd' : '#cc8844');
                    const scoreText = `${rank}. ⏱️${timeStr}  ${score.diamonds}💎 - ${score.playerName}`;
                    
                    // Highlight if it's the player's score in top 3
                    const highlight = (score.playerName === playerName) ? ' ✓' : '';
                    
                    this.add.text(width / 2 - 380, scoreY, scoreText + highlight, {
                        fontSize: '14px',
                        color: rankColor,
                        fontFamily: 'Arial',
                        fontStyle: (score.playerName === playerName) ? 'bold' : 'normal'
                    }).setOrigin(0, 0).setDepth(11001).setScrollFactor(0);
                });
                
                // If player is not in top 3, show their position in 4th row
                if (playerRank > 3) {
                    const scoreY = yPos + 28 + (3 * 12);
                    const timeStr = this.formatTime(playerScore.time);
                    const scoreText = `${playerRank}. ⏱️${timeStr}  ${playerScore.diamonds}💎 - ${playerName} (you)`;
                    
                    this.add.text(width / 2 - 380, scoreY, scoreText, {
                        fontSize: '14px',
                        color: '#00ff00',
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        backgroundColor: '#1a1a00',
                        padding: { x: 4, y: 2 }
                    }).setOrigin(0, 0).setDepth(11001).setScrollFactor(0);
                }
            } else {
                // No local score for this level, show top 3 global only
                const topScores = allScores.slice(0, 3);
                if (topScores.length > 0) {
                    topScores.forEach((score, index) => {
                        const scoreY = yPos + 28 + (index * 12);
                        const timeStr = this.formatTime(score.time);
                        const rank = index + 1;
                        const rankColor = index === 0 ? '#ffdd00' : (index === 1 ? '#dddddd' : '#cc8844');
                        const scoreText = `${rank}. ⏱️${timeStr}  ${score.diamonds}💎 - ${score.playerName}`;
                        
                        this.add.text(width / 2 - 380, scoreY, scoreText, {
                            fontSize: '14px',
                            color: rankColor,
                            fontFamily: 'Arial'
                        }).setOrigin(0, 0).setDepth(11001).setScrollFactor(0);
                    });
                } else {
                    const scoreY = yPos + 28;
                    this.add.text(width / 2 - 380, scoreY, '— Not completed yet —', {
                        fontSize: '14px',
                        color: '#666666',
                        fontStyle: 'italic',
                        fontFamily: 'Arial'
                    }).setOrigin(0, 0).setDepth(11001).setScrollFactor(0);
                }
            }
        }
        
        // Close button
        const closeButton = this.add.rectangle(width / 2, height - 80, 200, 50, 0xaa3333, 1)
            .setOrigin(0.5)
            .setDepth(11001)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });
        
        const closeText = this.add.text(width / 2, height - 80, 'Close', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11002).setScrollFactor(0);
        
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(0xcc4444);
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(0xaa3333);
        });
        
        closeButton.on('pointerdown', () => {
            // Destroy all highscore UI elements
            const allObjects = this.children.list.filter(obj => 
                obj.depth >= 11000 && obj.depth <= 11002
            );
            allObjects.forEach(obj => {
                if (obj && obj.scene) obj.destroy();
            });
        });
        
        // Animate in
        const allHighscoreObjects = this.children.list.filter(obj => 
            obj.depth >= 11000 && obj.depth <= 11002
        );
        
        allHighscoreObjects.forEach(obj => {
            if (obj !== overlay) {
                obj.setAlpha(0);
                this.tweens.add({
                    targets: obj,
                    alpha: 1,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
    }

    showNameInputDialog() {
        return new Promise((resolve) => {
            const width = this.scale.width;
            const height = this.scale.height;
            
            // Create input overlay
            const inputOverlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.85)
                .setOrigin(0).setDepth(12000).setScrollFactor(0).setInteractive();
            
            // Create dialog box
            const dialogWidth = 500;
            const dialogHeight = 250;
            const dialogBg = this.add.rectangle(width / 2, height / 2, dialogWidth, dialogHeight, 0x1a1a2e, 1)
                .setDepth(12001).setScrollFactor(0)
                .setStrokeStyle(3, 0x00ff00);
            
            // Title
            const titleText = this.add.text(width / 2, height / 2 - 80, 'Enter Your Name', {
                fontSize: '28px',
                color: '#00ff00',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            // HTML Input (using DOM)
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.maxLength = '20';
            inputElement.placeholder = 'Your name...';
            inputElement.style.position = 'absolute';
            inputElement.style.width = '300px';
            inputElement.style.height = '40px';
            inputElement.style.fontSize = '18px';
            inputElement.style.padding = '10px';
            inputElement.style.left = Math.floor(window.innerWidth / 2 - 150) + 'px';
            inputElement.style.top = Math.floor(window.innerHeight / 2 - 20) + 'px';
            inputElement.style.zIndex = '10000';
            inputElement.style.border = '2px solid #00ff00';
            inputElement.style.backgroundColor = '#111111';
            inputElement.style.color = '#00ff00';
            inputElement.style.fontFamily = 'Arial';
            document.body.appendChild(inputElement);
            inputElement.focus();
            
            // OK button
            const okBtn = this.add.rectangle(width / 2 - 100, height / 2 + 40, 180, 50, 0x00aa00, 1)
                .setDepth(12001).setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x00ff00);
            
            const okText = this.add.text(width / 2 - 100, height / 2 + 40, 'OK', {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            // Cancel button
            const cancelBtn = this.add.rectangle(width / 2 + 100, height / 2 + 40, 180, 50, 0xaa0000, 1)
                .setDepth(12001).setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0xff0000);
            
            const cancelText = this.add.text(width / 2 + 100, height / 2 + 40, 'Cancel', {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(12002).setScrollFactor(0);
            
            const cleanupDialog = () => {
                inputOverlay.destroy();
                dialogBg.destroy();
                titleText.destroy();
                okBtn.destroy();
                okText.destroy();
                cancelBtn.destroy();
                cancelText.destroy();
                document.body.removeChild(inputElement);
            };
            
            okBtn.on('pointerdown', () => {
                const name = inputElement.value.trim() || 'Anonymous';
                cleanupDialog();
                resolve(name);
            });
            
            cancelBtn.on('pointerdown', () => {
                cleanupDialog();
                resolve(null);
            });
            
            // Allow Enter key to submit
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const name = inputElement.value.trim() || 'Anonymous';
                    cleanupDialog();
                    resolve(name);
                }
            });
            
            okBtn.on('pointerover', () => okBtn.setFillStyle(0x00ff00));
            okBtn.on('pointerout', () => okBtn.setFillStyle(0x00aa00));
            cancelBtn.on('pointerover', () => cancelBtn.setFillStyle(0xff0000));
            cancelBtn.on('pointerout', () => cancelBtn.setFillStyle(0xaa0000));
        });
    }

'''

# Replace the section
new_content = content[:start_idx] + new_function + content[end_idx:]

# Write the file back
with open('src/scenes/DefogGamev0.04.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Successfully updated showHighscores() function and added showNameInputDialog()")
