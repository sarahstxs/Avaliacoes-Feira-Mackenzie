        // --- CONFIGURAÇÃO: URL DO GOOGLE APPS SCRIPT ---
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcPDFgruI49MxgKzb7fdTvbWCdTDPZcRfMztBLih43rdC62e8AB9ADBSKKQFHvzyxqbQ/exec';

        // --- BASE DE DADOS (Imagens geradas automaticamente como placeholders coloridos) ---
        // Você pode trocar as URLs pelas imagens reais das turmas.
        const dbData = {
            levels: [
                { id: 'infantil', name: 'Educação Infantil', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80' },
                { id: 'fund1', name: 'Ensino Fundamental 1', img: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=500&q=80' },
                { id: 'fund2', name: 'Ensino Fundamental 2', img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=500&q=80' },
                { id: 'medio', name: 'Ensino Médio', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=80' }
            ],
            classes: {
                'Educação Infantil': [
                    { name: 'Maternal', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=Maternal' },
                    { name: 'Jardim 1', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=Jardim+1' },
                    { name: 'Jardim 2', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=Jardim+2' }
                ],
                'Ensino Fundamental 1': [
                    { name: '1º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=1%C2%BA+Ano' },
                    { name: '2º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=2%C2%BA+Ano' },
                    { name: '3º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=3%C2%BA+Ano' },
                    { name: '4º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=4%C2%BA+Ano' },
                    { name: '5º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=5%C2%BA+Ano' }
                ],
                'Ensino Fundamental 2': [
                    { name: '6º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=6%C2%BA+Ano' },
                    { name: '7º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=7%C2%BA+Ano' },
                    { name: '8º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=8%C2%BA+Ano' },
                    { name: '9º Ano', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=9%C2%BA+Ano' }
                ],
                'Ensino Médio': [
                    { name: '1ª Série', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=1%C2%AA+S%C3%A9rie' },
                    { name: '2ª Série', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=2%C2%AA+S%C3%A9rie' },
                    { name: '3ª Série', img: 'https://placehold.co/400x250/F3E8FF/7C3AED?text=3%C2%AA+S%C3%A9rie' }
                ]
            }
        };

// --- ESTADO DA APLICAÇÃO ---
const appState = {
            selectedLevel: '',
            selectedClass: '',
            starsRating: 0,

            // Ação: Selecionar o Nível
            setLevel(levelName) {
                this.selectedLevel = levelName;
                uiRenderer.renderClasses(levelName);
                navigation.showScreen('screen-classes', `Turmas - ${levelName}`);
            },

            // Ação: Selecionar a Sala
            setClass(className) {
                this.selectedClass = className;
                this.starsRating = 0; // Reseta estrelas
                uiRenderer.prepareEvalScreen(this.selectedLevel, className);
                navigation.showScreen('screen-eval', 'Deixe sua avaliação');
            },

// Ação: Enviar Formulário para o Google Sheets
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
                .then(response => response.text()) // LÊ COMO TEXTO PRIMEIRO
                .then(text => {
                    try {
                        const data = JSON.parse(text); // TENTA CONVERTER
                        
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
                        // SE DER ERRO, VAI MOSTRAR EXATAMENTE O QUE O GOOGLE RESPONDEU
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
        // --- SISTEMA DE NAVEGAÇÃO ---
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

        // --- RENDERIZADOR DE INTERFACE (DOM) ---
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

            // Renderiza os cards das salas baseados no nível escolhido
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

            // Limpa e prepara a tela de avaliação
            prepareEvalScreen(level, cls) {
                document.getElementById('eval-title').innerText = cls;
                document.getElementById('eval-badge').innerText = level;
                document.getElementById('comment').value = '';
                document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
            },

            // Configura a interatividade das estrelas
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
