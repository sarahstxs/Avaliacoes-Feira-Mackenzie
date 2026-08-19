        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcPDFgruI49MxgKzb7fdTvbWCdTDPZcRfMztBLih43rdC62e8AB9ADBSKKQFHvzyxqbQ/exec';


        const dbData = {
            levels: [
                { id: 'infantil', name: 'Educação Infantil', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_sT41YDMlsJHHJlTS0SCMYenE80AAnv1KUNaayTdcLw&s=10' },
                { id: 'fund1', name: 'Ensino Fundamental 1', img: 'https://cptstatic.s3.amazonaws.com/imagens/enviadas/materias/materia15208/como-deve-ser-o-curriculo-do-1-ano-do-ensino-fundamental-cpt6.jpg' },
                { id: 'fund2', name: 'Ensino Fundamental 2', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNG0w1cLHHaiJBzgY-kUobbDLSEaZkpdB_h1OgI0THR0qTf-3xmWaKsiTS&s=10' },
                { id: 'medio', name: 'Ensino Médio', img: 'https://blog.sesiescolas.fiemg.com.br/hubfs/Como%20%C3%A9%20a%20transi%C3%A7%C3%A3o%20do%20Ensino%20Fundamental%202%20para%20o%20M%C3%A9dio%3F%20blog.svg' }
            ],
            classes: {
                'Educação Infantil': [
                    { name: 'Maternal I', img: './img/Quem sou eu 1.png' },
                    { name: 'Maternal II', img: './img/Quem sou eu 2.png' },
                    { name: 'Jardim I', img: './img/Trajeto da escola.png' },
                    { name: 'Jardim II', img: './img/Amigos.png' }
                ],
                'Ensino Fundamental 1': [
                    { name: '1º Ano', img: './img/Detetive do tempo.png' },
                    { name: '2º Ano A', img: './img/Animais e engenhocas 1.png' },
                    { name: '2º Ano B', img: './img/Animais e engenhocas 2.png' },
                    { name: '2º Ano C', img: './img/Animais e engenhocas 3.png' },
                    { name: '3º Ano A', img: './img/Herois 1.png' },
                    { name: '3º Ano B', img: './img/Audicao.png' },
                    { name: '3º Ano C', img: './img/Herois 2.png' },
                    { name: '4º Ano A', img: './img/Oceano.png' },
                    { name: '4º Ano B', img: './img/Abelhas.png' },
                    { name: '5º Ano A e B', img: './img/quinto.png' }
                ],
                'Ensino Fundamental 2': [
                    { name: '6º Ano A', img: './img/cora.png' },
                    { name: '6º Ano B', img: './img/Hospedaria.png' },
                    { name: '7º Ano', img: './img/castro.png' },
                    { name: '8º Ano', img: './img/meireles.png' },
                    { name: '9º Ano', img: './img/Paulo.png' }
                ],
                'Ensino Médio': [
                    { name: '1ª Série', img: './img/carlos.png' },
                    { name: '2ª Série', img: './img/periferica.png' },
                    { name: '3ª Série', img: './img/cordel.png' }
                ]
            }
        };

// --- ESTADO DA APLICAÇÃO ---
const appState = {
            selectedLevel: '',
            selectedClass: '',
            starsRating: 0,

            setLevel(levelName) {
                this.selectedLevel = levelName;
                uiRenderer.renderClasses(levelName);
                navigation.showScreen('screen-classes', `Turmas - ${levelName}`);
            },

            setClass(className) {
                this.selectedClass = className;
                this.starsRating = 0; // Reseta estrelas
                uiRenderer.prepareEvalScreen(this.selectedLevel, className);
                navigation.showScreen('screen-eval', 'Deixe sua avaliação');
            },

// Enviar Formulário para o Google Sheets
submitEvaluation() {
                const emailInput = document.getElementById('user-email').value.trim();
                
                if (!emailInput || !emailInput.includes('@')) {
                    alert("Por favor, insira um e-mail válido para avaliar.");
                    return;
                }
                if (this.starsRating === 0) {
                    alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
                    return;
                }

                const comentarioText = document.getElementById('comment').value;
                const btn = document.getElementById('btn-submit');
                btn.innerText = "Enviando...";
                btn.disabled = true;

                const dataParams = new URLSearchParams();
                dataParams.append('Nivel', this.selectedLevel);
                dataParams.append('Sala', this.selectedClass);
                dataParams.append('Estrelas', this.starsRating);
                dataParams.append('Comentario', comentarioText);
                dataParams.append('Email', emailInput);

                const finalUrl = GOOGLE_SCRIPT_URL + '?' + dataParams.toString();

                fetch(finalUrl, {
                    method: 'GET'
                })
                .then(response => response.text()) 
                .then(text => {
                    try {
                        const data = JSON.parse(text); 
                        
                        if (data.result === 'duplicate_ignored') {
                            alert("Aviso: O e-mail informado já enviou uma avaliação para esta turma. Não é possível avaliar duas vezes!");
                            btn.innerText = "Enviar Avaliação";
                            btn.disabled = false;
                        } 
                        else if (data.result === 'success') {
                            navigation.showScreen('screen-success', 'Avaliação Enviada');
                            btn.innerText = "Enviar Avaliação";
                            btn.disabled = false;
                            document.getElementById('user-email').value = ''; 
                            document.getElementById('comment').value = ''; 
                        } 
                        else {
                            throw new Error(data.error || "Erro desconhecido no servidor.");
                        }
                    } catch (e) {
                        console.error("O Google devolveu um erro em vez de JSON:", text);
                        alert("Erro de conexão: O script do Google não foi atualizado corretamente. Veja o console.");
                        btn.innerText = "Enviar Avaliação";
                        btn.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Houve um erro ao enviar. Verifique sua conexão ou tente novamente.");
                    console.error("Erro no Fetch:", error);
                    btn.innerText = "Enviar Avaliação";
                    btn.disabled = false;
                });
            }   
         };
        const navigation = {
            showScreen(screenId, subtitle) {
                // Esconde todas as telas
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                // Mostra a tela alvo
                document.getElementById(screenId).classList.add('active');
                // Atualiza o subtítulo do cabeçalho
                document.getElementById('header-subtitle').innerText = subtitle;
            },
            goBackToLevels() {
                this.showScreen('screen-levels', 'Selecione o nível de ensino para começar');
            },
            goBackToClasses() {
                this.showScreen('screen-classes', `Turmas - ${appState.selectedLevel}`);
            },
            restartApp() {
                this.goBackToLevels();
            }
        };

        const uiRenderer = {
            // Inicializa a tela 1
            init() {
                const container = document.getElementById('levels-container');
                dbData.levels.forEach(level => {
                    const card = this.createCard(level.name, level.img, () => appState.setLevel(level.name));
                    container.appendChild(card);
                });
                this.setupStars();
            },

            renderClasses(levelName) {
                const container = document.getElementById('classes-container');
                container.innerHTML = ''; // Limpa as salas antigas
                
                const classes = dbData.classes[levelName];
                classes.forEach(cls => {
                    const card = this.createCard(cls.name, cls.img, () => appState.setClass(cls.name));
                    container.appendChild(card);
                });
            },

            // Cria os elementos HTML do Card
            createCard(titleText, imgSrc, onClickCallback) {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = onClickCallback;

                const img = document.createElement('img');
                img.className = 'card-img';
                img.src = imgSrc;
                img.alt = titleText;

                const title = document.createElement('div');
                title.className = 'card-title';
                title.innerText = titleText;

                card.appendChild(img);
                card.appendChild(title);
                return card;
            },

            prepareEvalScreen(level, cls) {
                document.getElementById('eval-title').innerText = cls;
                document.getElementById('eval-badge').innerText = level;
                document.getElementById('comment').value = '';
                document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
            },

            // Interatividade das estrelas
            setupStars() {
                document.querySelectorAll('.star').forEach(star => {
                    star.addEventListener('click', function() {
                        document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
                        this.classList.add('selected');
                        appState.starsRating = parseInt(this.getAttribute('data-value'));
                    });
                });
            }
        };

        // Inicializa o app quando a página carregar
        window.onload = () => {
            uiRenderer.init();
        };
