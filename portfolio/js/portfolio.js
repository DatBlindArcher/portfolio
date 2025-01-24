class Portfolio {
    #paused;
    #options;
    #projects;
    #hidden_projects;

    init() {
        this.#paused = false;
        this.#projects = document.querySelector("#projects");
        this.#hidden_projects = document.querySelector("#hidden_projects");

        let pause_button = document.querySelector("#pause");
        pause_button.onclick = this.toggle_anim.bind(this);
        
        var fillDivs = document.querySelectorAll(".filters");
        var filters = [...fillDivs[0].children, ...fillDivs[1].children];
        var self = this;
        self.#options = new Set();
        
        for (let filter of filters) {
            let option = filter.classList[0];

            filter.addEventListener('click', e => {
                if (filter.classList.contains('disabled')) {
                    filter.classList.remove('disabled');
                    self.#options.add(option);
                }
                else {
                    filter.classList.add('disabled'); 
                    self.#options.delete(option);
                }

                self.updateProjects();
            });

            self.#options.add(option);
        }

        self.updateProjects();
    }

    updateProjects() {
        for (let project of [...this.#projects.children]) {
            for (let label of project.children[0].children[1].children) {
                let option = label.classList[0];

                if (!this.#options.has(option)) {
                    this.#hidden_projects.prepend(project);
                    break;
                }
            }
        }

        for (let project of [...this.#hidden_projects.children]) {
            let move = true;

            for (let label of project.children[0].children[1].children) {
                let option = label.classList[0];

                if (!this.#options.has(option)) {
                    move = false;
                    break;
                }
            }

            if (move) this.#projects.prepend(project);
        }
    }

    toggle_anim() {
        this.#paused = !this.#paused;
        let icon = document.querySelector("#pause").querySelector("i");
        let hex_anim = document.querySelector(".hex_pattern");
        
        mast.isRunning = !this.#paused;
        if (!this.#paused) hex_anim.classList.remove("reset");
        else hex_anim.classList.add("reset");

        if (this.#paused) {
            icon.classList.remove("pause");
            icon.classList.add("play");
        }

        else {
            icon.classList.remove("play");
            icon.classList.add("pause");
        }
    }
}