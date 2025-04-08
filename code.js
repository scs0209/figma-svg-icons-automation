figma.showUI(__html__, { width: 400, height: 400 });

// 선택된 노드를 SVG로 내보내기
async function exportSelectedNodesToSvg() {
  const selectedNodes = figma.currentPage.selection;

  if (selectedNodes.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: '내보내려는 아이콘을 선택해주세요.'
    });
    return;
  }

  const exports = [];
  
  for (const node of selectedNodes) {
    try {
      const svg = await node.exportAsync({
        format: 'SVG'
      });
      
      const svgString = String.fromCharCode.apply(null, svg);
      
      exports.push({
        name: node.name,
        svg: svgString
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: `"${node.name}" 내보내기 실패: ${error.message}`
      });
    }
  }

  figma.ui.postMessage({
    type: 'svg-exports',
    data: exports
  });
}

// 터미널 명령어 실행
async function runCommand(command, cwd) {
  try {
    // 명령어 실행
    const result = await figma.execCommand(command, cwd);
    
    // 성공 응답 전송
    figma.ui.postMessage({
      type: 'command-result',
      data: {
        success: true,
        result
      }
    });
  } catch (error) {
    // 실패 응답 전송
    figma.ui.postMessage({
      type: 'command-result',
      data: {
        success: false,
        error: error.message
      }
    });
  }
}

// 메세지 핸들러
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-svg') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('선택된 아이콘이 없습니다.');
      return;
    }

    const exports = [];
    for (const node of selection) {
      try {
        const svg = await node.exportAsync({ format: 'SVG' });
        const svgString = String.fromCharCode.apply(null, svg);
        exports.push({
          name: node.name,
          data: svgString
        });
      } catch (error) {
        figma.notify(`${node.name} 내보내기 실패: ${error.message}`);
      }
    }

    figma.ui.postMessage({ type: 'svg-exports', data: exports });
  } else if (msg.type === 'run-command') {
    await runCommand(msg.data.command, msg.data.cwd);
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};