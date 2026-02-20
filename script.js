class Pomodoro {
    constructor(){
        this.timerEl = document.getElementById("timer");

        this.isRunning = false;
        this.interval = null;
        this.isBreak = false;

        this.data = JSON.parse(localStorage.getItem("pomodoro")) || {
            history:{},
            settings:{focus:45, break:15, sound:true}
        };

        this.applySettings();
        this.bindEvents();
        this.updateStats();
    }

    bindEvents(){
        document.getElementById("start").onclick = ()=>this.start();
        document.getElementById("pause").onclick = ()=>this.pause();
        document.getElementById("reset").onclick = ()=>this.reset();

        document.querySelectorAll(".nav-item").forEach(btn=>{
            btn.onclick=(e)=>{
                e.preventDefault();

                document.querySelectorAll(".nav-item").forEach(b=>b.classList.remove("active"));
                btn.classList.add("active");

                document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
                document.getElementById("view-"+btn.dataset.view).classList.add("active-view");

                this.updateStats();
                this.loadSettingsUI();
            };
        });

        document.getElementById("saveSettings").onclick=()=>this.saveSettings();
        document.getElementById("resetStats").onclick=()=>this.resetStats();
    }

    applySettings(){
        this.totalTime = this.data.settings.focus * 60;
        this.time = this.totalTime;
        this.updateDisplay();
    }

    start(){
        if(this.isRunning) return;

        this.isRunning=true;

        this.interval=setInterval(()=>{
            this.time--;
            this.updateDisplay();

            if(this.time<=0) this.complete();
        },1000);
    }

    pause(){
        this.isRunning=false;
        clearInterval(this.interval);
    }

    reset(){
        this.pause();
        this.applySettings();
    }

    complete(){
        this.pause();

        if(!this.isBreak){
            const today=new Date().toISOString().split("T")[0];

            if(!this.data.history[today])
                this.data.history[today]={sessions:0,focus:0};

            this.data.history[today].sessions++;
            this.data.history[today].focus+=this.data.settings.focus;
        }

        this.isBreak=!this.isBreak;

        this.totalTime=(this.isBreak?this.data.settings.break:this.data.settings.focus)*60;
        this.time=this.totalTime;

        this.save();
        this.updateStats();
        this.updateDisplay();

        if(this.data.settings.sound) alert("Session finished!");
    }

    updateDisplay(){
        const m=Math.floor(this.time/60).toString().padStart(2,"0");
        const s=(this.time%60).toString().padStart(2,"0");
        this.timerEl.textContent=`${m}:${s}`;
    }

    updateStats(){
        const today=new Date().toISOString().split("T")[0];
        const todayData=this.data.history[today]||{sessions:0,focus:0};

        document.getElementById("todaySessions").textContent=todayData.sessions;
        document.getElementById("todayFocus").textContent=todayData.focus;

        let best=0;
        Object.values(this.data.history).forEach(d=>{
            if(d.sessions>best) best=d.sessions;
        });

        document.getElementById("bestDay").textContent=best;
    }

    loadSettingsUI(){
        focusInput.value=this.data.settings.focus;
        breakInput.value=this.data.settings.break;
        soundInput.checked=this.data.settings.sound;
    }

    saveSettings(){
        this.data.settings.focus=parseInt(focusInput.value);
        this.data.settings.break=parseInt(breakInput.value);
        this.data.settings.sound=soundInput.checked;

        this.applySettings();
        this.save();
    }

    resetStats(){
        this.data.history={};
        this.save();
        this.updateStats();
    }

    save(){
        localStorage.setItem("pomodoro",JSON.stringify(this.data));
    }
}

new Pomodoro();
