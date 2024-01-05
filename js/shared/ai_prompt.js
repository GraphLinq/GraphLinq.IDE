import { checkRun, createRun, createThread, getRunCode } from "../services/ai_api";

export default class AIPrompt {
    constructor(app) {
        this.app = app;
        this.isLoading = false;
        this.loadingDiv = document.querySelector("#ai-thinking-loading");
        this.loadingDivTwo = document.querySelector("#ai-prompt .load");
        this.inputField = document.querySelector("#ai-prompt input");
        this.setLoading(false);

        // Set API temp values
        this.currentThread = "";
        if(localStorage.getItem('currentThread') != "") {
            //this.currentRun = localStorage.getItem('currentThread');
            //this.app.terminal.append("debug", "AI Thread recovered");
        }
        this.currentRun = "";

        // Set events
        this.inputField.addEventListener("keyup", (e) => {
            if(e.keyCode == 13 && !this.isLoading) {
                this.submitPrompt();
            }
        })
    }

    setLoading(state) {
        this.isLoading = state;
        if(state) {
            this.loadingDiv.style.display = "inline-block";
            this.loadingDivTwo.style.display = "block";
            this.inputField.style.display = "none";
        }
        else {
            this.loadingDiv.style.display = "none";
            this.loadingDivTwo.style.display = "none";
            this.inputField.style.display = "inline-block";
        }
    }

    async submitPrompt() {
        const prompt = this.inputField.value;
        if(prompt.length < 10) {
            return;
        }
        this.inputField.value = "";

        this.app.terminal.append("success", "Prompt submitted to the Graphlinq AI, please wait few seconds ..");
        this.setLoading(true);

        // Create a thread if doesnt exist
        if(this.currentThread == "") {
            const threadResult = await createThread();
            this.currentThread = threadResult.id;
            localStorage.setItem('currentThread', this.currentThread);
            this.app.terminal.append("ai", "New thread create with the Graphlinq AI for context : " + this.currentThread);
        }
        
        // Submit a run
        const runResult = await createRun(this.currentThread, "!create " + prompt);
        this.waitForRun(runResult.id);
    }

    async waitForRun(runId) {
        this.currentRun = runId;
        let currentRunState = "in_progress";
        let loopCount = 0;
        while(currentRunState == "in_progress") {
            this.app.terminal.append("ai", "Graphlinq AI is thinking since " + ((loopCount * 3) + 3) + "s ...");
            const checkRunStateResult = await checkRun(this.currentThread, this.currentRun);
            currentRunState = checkRunStateResult.state;
            await this.waitFor(3000);
            loopCount++;
        }
        
        const codeResult = await getRunCode(this.currentThread, this.currentRun);
        try {
            eval(codeResult);
            this.app.terminal.append("success", "Prompt executed with success");
        }
        catch(ex) {
            this.app.terminal.append("error", "Prompt execution failed, please retry and change the prompt");
        }

        this.currentRun = "";
        this.setLoading(false);
    }

    waitFor(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms)
        });
    }
}