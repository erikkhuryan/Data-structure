document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const textInput = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const byteCount = document.getElementById('byteCount');
  const charTableBody = document.getElementById('charTableBody');
  const ramGrid = document.getElementById('ramGrid');
  const ramInfo = document.getElementById('ramInfo');
  const typeButtons = document.querySelectorAll('.type-buttons .btn');

  // --- 1. Interactive Converter Logic ---
  function updateTextConverter() {
    const text = textInput.value;
    charTableBody.innerHTML = '';
    
    let totalBytes = 0;
    const chars = Array.from(text);

    chars.forEach((char) => {
      const codePoint = char.codePointAt(0);
      const utf8Bytes = new TextEncoder().encode(char);
      const bytesLen = utf8Bytes.length;
      totalBytes += bytesLen;

      // Determine display name
      let name = 'Սովորական սիմվոլ';
      if (char === ' ') name = ' Space (Բացատ)';
      else if (char === '\n') name = ' Newline (Նոր տող)';
      else if (codePoint >= 1329 && codePoint <= 1423) name = 'Հայերեն տառ (UTF-8)';
      else if (codePoint >= 48 && codePoint <= 57) name = 'Թվանշան';
      else if (/[#$&+_()/@*:"'?!/-]/.test(char)) name = 'Հատուկ սիմվոլ';

      // Binary string
      const binaryStr = Array.from(utf8Bytes)
        .map(b => b.toString(2).padStart(8, '0'))
        .join(' ');

      // Hex string
      const hexStr = Array.from(utf8Bytes)
        .map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="char-symbol">${char === ' ' ? 'Space' : (char === '\n' ? '\\n' : char)}</span></td>
        <td>${name}</td>
        <td>${codePoint}</td>
        <td><code class="code-inline">${hexStr}</code></td>
        <td><span class="binary-badge">${binaryStr}</span></td>
        <td><strong>${bytesLen} Byte${bytesLen > 1 ? 's' : ''}</strong></td>
      `;
      charTableBody.appendChild(tr);
    });

    charCount.textContent = chars.length;
    byteCount.textContent = `${totalBytes} Byte${totalBytes !== 1 ? 's' : ''}`;
  }

  textInput.addEventListener('input', updateTextConverter);
  updateTextConverter(); // Initial run

  // --- 2. RAM Memory Simulation Logic ---
  const ramPresets = {
    'bool': {
      bytes: 1,
      name: 'Boolean (true)',
      values: ['00000001'],
      desc: '<strong>Boolean true:</strong> Զբաղեցնում է 1 բայթ RAM-ում։ Արժեքը 1 է (00000001)։'
    },
    'int': {
      bytes: 4,
      name: 'Integer (42)',
      values: ['00000000', '00000000', '00000000', '00101010'],
      desc: '<strong>32-bit Integer (42):</strong> Զբաղեցնում է 4 բայթ (32 բիթ) RAM-ում՝ 4 իրար հաջորդող հասցեներում։'
    },
    'double': {
      bytes: 8,
      name: 'Double (3.14)',
      values: ['40', '09', '21', 'FB', '54', '44', '2D', '18'],
      desc: '<strong>64-bit Double (3.14):</strong> Զբաղեցնում է 8 բայթ հիշողություն՝ IEEE 754 ստանդարտով։'
    },
    'char': {
      bytes: 1,
      name: "Char ('A')",
      values: ['01000001'],
      desc: '<strong>Char ASCII (\'A\'):</strong> 1 բայթ, ASCII կոդն է 65 (երկուական՝ 01000001)։'
    },
    'str-en': {
      bytes: 2,
      name: 'String ("Hi")',
      values: ['01001000', '01101001'],
      desc: '<strong>String ASCII ("Hi"):</strong> 2 սիմվոլ × 1 բայթ = 2 բայթ RAM-ում + Pointer/Length metadata Heap-ում։'
    },
    'str-hy': {
      bytes: 6,
      name: 'String ("Հայ")',
      values: ['D5 80', 'D5 81', 'D5 B5'],
      desc: '<strong>String UTF-8 ("Հայ"):</strong> Ամեն հայերեն տառը UTF-8-ում 2 բայթ է, ուստի 3 տառը = 6 բայթ RAM-ում։'
    }
  };

  function renderRAM(presetKey) {
    const preset = ramPresets[presetKey];
    ramGrid.innerHTML = '';

    const baseAddress = 0x1000;
    const totalCells = 8; // Display 8 slots in RAM simulation

    for (let i = 0; i < totalCells; i++) {
      const currentAddr = '0x' + (baseAddress + i).toString(16).toUpperCase();
      const isAllocated = i < preset.values.length;
      const val = isAllocated ? preset.values[i] : '00000000';

      const cell = document.createElement('div');
      cell.className = `ram-cell ${isAllocated ? 'allocated' : ''}`;
      cell.innerHTML = `
        <div class="ram-addr">${currentAddr}</div>
        <div class="ram-val">${val}</div>
      `;
      ramGrid.appendChild(cell);
    }

    ramInfo.innerHTML = preset.desc;
  }

  typeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      typeButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderRAM(e.target.dataset.type);
    });
  });

  // Initial RAM display
  renderRAM('bool');
});