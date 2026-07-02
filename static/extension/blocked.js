document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const targetDomain = params.get('domain') || '';
    document.getElementById('target-domain').textContent = targetDomain;

    const startCamBtn = document.getElementById("startCamBtn");
    const scanBtn = document.getElementById("scanBtn");
    const video = document.getElementById("scanVideo");
    const canvas = document.getElementById("scanCanvas");
    const statusEl = document.getElementById("status");
    const loader = document.getElementById("loader");
    const loaderText = document.getElementById("loaderText");

    let localStream = null;
    let humanInstance = null;
    let isDrawLoopActive = false;

    // Dot product cosine similarity for normalized vectors
    function calculateSimilarity(v1, v2) {
        if (!v1 || !v2 || v1.length !== v2.length) return 0;
        let dotProduct = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
        }
        return dotProduct;
    }

    async function initHuman() {
        try {
            statusEl.textContent = "Loading AI models from CDN...";
            showLoader("Downloading facial models...");
            
            humanInstance = new Human.Human({
                modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
                face: { 
                    enabled: true, 
                    detector: { returnShort: false }, 
                    emotion: { enabled: false }, 
                    embedding: { enabled: true } 
                },
                body: { enabled: false },
                hand: { enabled: false }
            });
            
            await humanInstance.load();
            hideLoader();
            statusEl.textContent = "AI Engine ready. Click Start Camera.";
        } catch (err) {
            console.error("AI load failed:", err);
            statusEl.textContent = "Failed to load AI engine. Reload page or check internet connection.";
            hideLoader();
        }
    }

    function showLoader(text) {
        loaderText.textContent = text;
        loader.classList.add("active");
    }

    function hideLoader() {
        loader.classList.remove("active");
    }

    async function startCamera() {
        try {
            statusEl.textContent = "Requesting webcam permissions...";
            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
            }
            
            localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false
            });
            
            video.srcObject = localStream;
            video.onloadedmetadata = () => {
                video.play();
                statusEl.textContent = "Camera feed live. Align face and click Scan.";
                scanBtn.disabled = false;
                if (humanInstance && !isDrawLoopActive) {
                    isDrawLoopActive = true;
                    drawLoop();
                }
            };
        } catch (err) {
            console.error("Webcam access failed:", err);
            statusEl.textContent = "Camera hardware blocked. Grant browser permissions and retry.";
            alert("Could not link camera hardware. Please check site permissions.");
        }
    }

    async function drawLoop() {
        if (!localStream || video.paused || video.ended) {
            isDrawLoopActive = false;
            return;
        }
        const result = await humanInstance.detect(video);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (result && result.face && result.face.length > 0) {
            humanInstance.draw.face(canvas, result.face);
        }
        requestAnimationFrame(drawLoop);
    }

    async function performScan() {
        if (!video.srcObject) {
            return alert("Enable camera streaming first.");
        }
        
        statusEl.textContent = "Analyzing facial coordinates...";
        showLoader("Computing face vector...");
        
        try {
            const analysis = await humanInstance.detect(video);
            hideLoader();
            
            if (!analysis || !analysis.face || analysis.face.length === 0 || !analysis.face[0].embedding) {
                statusEl.textContent = "Verification Failed: Face geometry unclear. Keep head steady.";
                return;
            }
            
            const liveEmbedding = analysis.face[0].embedding;
            
            // Fetch synced parent profiles from local extension storage
            const storage = await chrome.storage.local.get('syncedProfiles');
            const profiles = storage.syncedProfiles || [];
            const parentProfiles = profiles.filter(p => p.role === 'parent');
            
            if (parentProfiles.length === 0) {
                statusEl.textContent = "No parent identity profile registered. Set it up on the website first.";
                alert("No parent biometric profile has been synced. Please enroll a parent identity in the ChildGuard AI profile page.");
                return;
            }
            
            let bestSimilarity = 0;
            let matchingParent = null;
            
            for (const profile of parentProfiles) {
                const sim = calculateSimilarity(liveEmbedding, profile.embedding);
                if (sim > bestSimilarity) {
                    bestSimilarity = sim;
                    matchingParent = profile;
                }
            }
            
            console.log("Scan analysis. Highest matching similarity:", bestSimilarity);
            
            // Match similarity threshold is 0.75 (cosine dot-product)
            if (bestSimilarity >= 0.75) {
                statusEl.textContent = `Parent Identity Verified (${matchingParent.parentName} - ${(bestSimilarity * 100).toFixed(1)}% Match). Unlocking site...`;
                showLoader("Applying temporary bypass...");
                
                // Message background to temporarily disable rules
                chrome.runtime.sendMessage({ 
                    action: 'unlockDomain', 
                    domain: targetDomain 
                }, (response) => {
                    hideLoader();
                    if (response && response.success) {
                        // Stop camera track
                        if (localStream) {
                            localStream.getTracks().forEach(t => t.stop());
                        }
                        // Redirect to the original domain
                        window.location.replace(`http://${targetDomain}`);
                    } else {
                        statusEl.textContent = "Unlock rule failed to register in service worker.";
                    }
                });
            } else {
                statusEl.textContent = `Biometric mismatch: Identity not recognized (Score: ${bestSimilarity.toFixed(3)}).`;
                alert(`Access Denied: Face does not match registered parent profile (Score: ${bestSimilarity.toFixed(3)}).`);
            }
        } catch (err) {
            console.error("Scan processing error:", err);
            statusEl.textContent = "Internal analysis error. Please try again.";
            hideLoader();
        }
    }

    startCamBtn.addEventListener("click", startCamera);
    scanBtn.addEventListener("click", performScan);

    initHuman();
});
