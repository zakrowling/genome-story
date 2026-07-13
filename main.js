function toggleModal(show) {
      const modal = document.getElementById('modal-overlay');
      modal.style.opacity = show ? '1' : '0';
      modal.style.pointerEvents = show ? 'auto' : 'none';
    }

    let isPanelCollapsed = false;
    function toggleStoryPanel() {
      const wrapper = document.getElementById('story-panel-wrapper');
      const toggleBtn = document.getElementById('toggle-panel-btn');
      isPanelCollapsed = !isPanelCollapsed;

      if (isPanelCollapsed) {
        wrapper.classList.add('collapsed');
        toggleBtn.innerHTML = '▶';
        toggleBtn.title = "Expand Panel";
      } else {
        wrapper.classList.remove('collapsed');
        toggleBtn.innerHTML = '◀';
        toggleBtn.title = "Collapse Panel";
      }
    }

    function updatePieHover(region, percentage) {
      document.getElementById('pie-region-label').innerText = region;
      document.getElementById('pie-percent-label').innerText = percentage;
    }

    function resetPieHover() {
      document.getElementById('pie-region-label').innerText = 'Heritage Breakdown';
      document.getElementById('pie-percent-label').innerText = '';
    }

    function selectPieSegment(storyKey) {
      const targetBtn = document.getElementById('btn-' + storyKey);
      flyToStory(storyKey, targetBtn);
    }

    const STORIES = {
      // 1. Heritage
      heritage_celtic: {
        title: "Irish & Scottish Ancestry (38%)",
        body: "Chromosomes 1 & 12. Gaelic genetic clusters tied to ancient Insular Celtic populations in Connacht (Ireland) and the Scottish Highlands.",
        tProgress: 0.05,
        color: 0x0079C8
      },
      heritage_english: {
        title: "English & NW European (30%)",
        body: "Chromosomes 4 & 18. Anglo-Saxon and Lowland European signatures centered across Southern England, Normandy, and the Rhine River basin.",
        tProgress: 0.11,
        color: 0x00d2ff
      },
      heritage_nordic: {
        title: "Norwegian & Swedish Ancestry (18%)",
        body: "Chromosome 5. Coastal Scandinavian haplotypes originating from Western Norway, associated with historic North Sea seafaring lineages.",
        tProgress: 0.17,
        color: 0x38bdf8
      },
      heritage_slavic: {
        title: "Polish & Baltic Ancestry (11.9%)",
        body: "Chromosome 14 (R1a-M458 marker region). West Slavic ancestry traceable to early agricultural settlements along the Vistula and Oder basins.",
        tProgress: 0.23,
        color: 0xa855f7
      },
      neanderthal: {
        title: "Ancient Neanderthal Relic (2.1%)",
        body: "Chromosome 3 (2p25.3 region). An archaic introgression segment from ~50,000 years ago that enhanced epidermal keratin density and UV synthesis.",
        tProgress: 0.29,
        color: 0xff3366
      },

      // 2. Nutrigenomics & Lifestyle Traits
      caffeine: {
        title: "You metabolise caffeine quickly (CYP1A2)",
        body: "Chromosome 15. You possess high-activity CYP1A2 liver enzymes, allowing rapid caffeine clearance without lingering sleep disruption or elevated jitteriness.",
        tProgress: 0.35,
        color: 0xffaa00
      },
      lactose: {
        title: "You are lactase persistent (tolerant) (LCT/MCM6)",
        body: "Chromosome 2. You carry the active lactase persistence regulatory variant, allowing smooth digestion of lactose and fresh dairy products throughout adulthood.",
        tProgress: 0.41,
        color: 0x33ff88
      },
      vitamin_d: {
        title: "You have standard Vitamin D binding efficiency (GC)",
        body: "Chromosome 4. Standard binding efficiency for circulating 25-hydroxyvitamin D, supporting optimal calcium absorption and bone turnover.",
        tProgress: 0.47,
        color: 0xffff33
      },
      fat_sensitivity: {
        title: "Moderate weight sensitivity to saturated fats (FTO)",
        body: "Chromosome 16. Your FTO intron variant indicates moderate weight sensitivity to high-saturated-fat diets, favoring balanced unsaturated fat intake.",
        tProgress: 0.53,
        color: 0xff8800
      },

      // 3. Cardiovascular & Health Risks
      heart: {
        title: "Heart health is at the optimal baseline",
        body: "Chromosome 9 (9p21 region). John, you carry protective variants that support healthy vascular lining and low natural inflammation around arterial walls.",
        tProgress: 0.59,
        color: 0x00f0ff
      },
      asthma: {
        title: "Normal airway and respiratory defense systems",
        body: "Chromosome 17 (ORMDL3). Your genetic profile indicates normal bronchial airway responsiveness to seasonal dust and environmental allergens.",
        tProgress: 0.65,
        color: 0x33ff88
      },
      colorectal: {
        title: "Healthy Digestive cell repair and maintenance",
        body: "Chromosome 8. High-performing mismatch repair markers that maintain healthy gastrointestinal cell renewal.",
        tProgress: 0.71,
        color: 0x00aeff
      },

      // 4. Inherited Traits & Carrier Status
      sickle_cell: {
        title: "Minor risk of sickle cell",
        body: "Chromosome 11 (HBB gene). Both gene copies produce standard hemoglobin, ensuring round, flexible red blood cells.",
        tProgress: 0.77,
        color: 0xffaa00
      },
      cystic_fibrosis: {
        title: "Clear of cystic fibrosis (CFTR)",
        body: "Chromosome 7. No CFTR channel mutations detected. Your body regulates cellular salt and fluid balance without disruption.",
        tProgress: 0.83,
        color: 0xcc66ff
      },
      brca: {
        title: "Low risk of breast cancer 1 and 2 genes (BRCA1 & BRCA2)",
        body: "Chromosomes 13 & 17. Your DNA repair machinery acts like a vigilant proofreader, detecting and repairing normal cell replication errors smoothly.",
        tProgress: 0.89,
        color: 0x33ffaa
      },

      // 5. Brain Development & Focus
      synapse: {
        title: "Normal brain pruning and development",
        body: "Chromosome 6 (C4A region). Manages standard synaptic pruning—the natural process where the brain streamlines neural connections during growth.",
        tProgress: 0.94,
        color: 0xff5522
      },
      dopamine: {
        title: " You have steady focus and dopamine balance (DRD4)",
        body: "Chromosome 11. Your receptor profile shows balanced dopamine signaling, supporting steady mental focus and task persistence.",
        tProgress: 0.98,
        color: 0xff33aa
      }
    };

    // --- Three.js Setup ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 75);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.addEventListener('start', () => SFX.startWhoosh());
    controls.addEventListener('end', () => SFX.stopWhoosh());

    // Laboratory Lighting Setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    const cyanPointLight = new THREE.PointLight(0x00f0ff, 2.5, 120);
    cyanPointLight.position.set(20, 30, 20);
    scene.add(cyanPointLight);

    // Rim light for edge glow
    const rimLight = new THREE.PointLight(0xff007f, 3.0, 100);
    rimLight.position.set(-30, -20, -30);
    scene.add(rimLight);

    // --- Generate Procedural DNA Groove Bump Map ---
    function createDNABumpMap() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 256, 256);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      for (let i = -256; i < 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 256, 256);
        ctx.stroke();
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(30, 1);
      return texture;
    }

    // --- Generate Folded Chromatin Backbone ---
    const curvePoints = [];
    const numPoints = 120;
    
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2 * 3;
      const x = Math.sin(t) * 16 + Math.cos(t * 2) * 4;
      const y = Math.cos(t) * 16 + Math.sin(t * 3) * 4;
      const z = Math.sin(t * 2) * 10;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 350, 0.85, 16, false);

    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x223042,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      bumpMap: createDNABumpMap(),
      bumpScale: 0.08,
      transparent: true,
      opacity: 0.88
    });

    const genomeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(genomeMesh);

    // --- Add Histone Octamers (Nucleosome Spheres) along curve ---
    const histoneGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const histoneMat = new THREE.MeshStandardMaterial({
      color: 0x0079C8,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x002244
    });

    const histoneCount = 32;
    const histoneInstanced = new THREE.InstancedMesh(histoneGeo, histoneMat, histoneCount);
    const dummyObj = new THREE.Object3D();

    for (let i = 0; i < histoneCount; i++) {
      const point = curve.getPointAt(i / histoneCount);
      dummyObj.position.copy(point);
      dummyObj.scale.setScalar(0.75 + Math.random() * 0.3);
      dummyObj.updateMatrix();
      histoneInstanced.setMatrixAt(i, dummyObj.matrix);
    }
    scene.add(histoneInstanced);

    // --- Add Atmospheric Cellular Fluid Particles ---
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      particlePos[i] = (Math.random() - 0.5) * 120;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.3,
      sizeAttenuation: true,
      color: 0x00f0ff,
      transparent: true,
      fog: false,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- Active Selection Hula-Hoop Ring Pivot Setup ---
    const ringGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(1.8, 0.08, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.85 });
    const locusRing = new THREE.Mesh(ringGeo, ringMat);

    ringGroup.add(locusRing);
    ringGroup.visible = false;
    scene.add(ringGroup);

    // --- Camera Fly-to & Positioning ---
    const tooltipEl = document.getElementById('tooltip-3d');
    const ttTitle = document.getElementById('tt-title');
    const ttBody = document.getElementById('tt-body');
    let activeTargetWorldPos = null;

    function flyToStory(storyKey, btnElement) {
      SFX.playWhooshSound();
      document.querySelectorAll('.explore-btn').forEach(b => b.classList.remove('active'));
      if (btnElement) btnElement.classList.add('active');

      const story = STORIES[storyKey];

      const localPoint = curve.getPointAt(story.tProgress);
      activeTargetWorldPos = genomeMesh.localToWorld(localPoint.clone());

      // 1. Position group at target point
      ringGroup.position.copy(activeTargetWorldPos);

      // 2. Align parent group Z-axis along the curve's tangent vector
      const tangent = curve.getTangentAt(story.tProgress).normalize();
      const defaultNormal = new THREE.Vector3(0, 0, 1);
      ringGroup.quaternion.setFromUnitVectors(defaultNormal, tangent);

      ringMat.color.setHex(story.color);
      ringGroup.visible = true;

      ttTitle.innerText = story.title;
      ttBody.innerText = story.body;
      tooltipEl.style.borderColor = `#${story.color.toString(16).padStart(6, '0')}`;
      tooltipEl.style.opacity = '1';

      gsap.to(tubeMaterial, { opacity: 0.4, duration: 0.8 });

      const offset = new THREE.Vector3().subVectors(camera.position, controls.target).normalize().multiplyScalar(20);
      const newCamPos = activeTargetWorldPos.clone().add(offset);

      gsap.to(camera.position, {
        x: newCamPos.x,
        y: newCamPos.y,
        z: newCamPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });

      gsap.to(controls.target, {
        x: activeTargetWorldPos.x,
        y: activeTargetWorldPos.y,
        z: activeTargetWorldPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });
    }

    function resetView() {
      SFX.playWhooshSound();
      document.querySelectorAll('.explore-btn').forEach(b => b.classList.remove('active'));
      activeTargetWorldPos = null;
      tooltipEl.style.opacity = '0';
      ringGroup.visible = false;

      gsap.to(tubeMaterial, { opacity: 0.88, duration: 0.8 });
      gsap.to(camera.position, { x: 0, y: 0, z: 75, duration: 1.5, ease: "power2.inOut" });
      gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.5, ease: "power2.inOut" });
    }

    function updateTooltipPosition() {
      if (!activeTargetWorldPos || tooltipEl.style.opacity === '0') return;

      const vector = activeTargetWorldPos.clone();
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y - 12}px`;
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      updateTooltipPosition();

      // Spin background particles gently
      particleSystem.rotation.y += 0.0003;

      // Spin inner ring mesh cleanly around its local Z-axis
      if (ringGroup.visible) {
        locusRing.rotation.z += 0.03;
      }

      // Rotate whole structure in resting view
      if (!activeTargetWorldPos) {
        genomeMesh.rotation.y += 0.0012;
        histoneInstanced.rotation.y += 0.0012;
      }

      renderer.render(scene, camera);
    }

    animate();

    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('mouseenter', () => SFX.playHoverSound());
      btn.addEventListener('click', () => SFX.playClickSound());
    });