#!/bin/bash
cat << 'INNER_EOF' > src/systems/DialogueManager.ts.patch
<<<<<<< SEARCH
        // Input setup
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-SPACE', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-ENTER', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-UP', this.handleChoiceUp, this);
            this.scene.input.keyboard.on('keydown-DOWN', this.handleChoiceDown, this);
        }
    }
=======
        // Input setup
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.on('keydown-SPACE', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-ENTER', this.handleAdvance, this);
            this.scene.input.keyboard.on('keydown-UP', this.handleChoiceUp, this);
            this.scene.input.keyboard.on('keydown-DOWN', this.handleChoiceDown, this);
        }
    }

    public updateGamepadInput(actionJustDown: boolean, upJustDown: boolean, downJustDown: boolean) {
        if (!this.isVisible) return;
        
        if (actionJustDown) {
            this.handleAdvance();
        }
        if (upJustDown) {
            this.handleChoiceUp();
        }
        if (downJustDown) {
            this.handleChoiceDown();
        }
    }
>>>>>>> REPLACE
INNER_EOF
