figma.showUI(__html__, { width: 450, height: 550 });

// 선택된 노드를 SVG로 내보내기
async function exportSelectedNodesToSvg() {
  const selectedNodes = figma.currentPage.selection;

  if (selectedNodes.length === 0) {
    figma.ui.postMessage({
      type: 'error',
      message: '내보낼 아이콘을 선택해주세요.',
    });
    return;
  }

  const svgExports = [];

  for (const node of selectedNodes) {
    try {
      // SVG로 내보내기
      const svgData = await node.exportAsync({
        format: 'SVG',
        svgOutlineText: true,
        svgIdAttribute: true,
        svgSimplifyStroke: true,
      });

      // UTF-8 문자열로 변환
      const svgString = String.fromCharCode.apply(
        null,
        new Uint8Array(svgData)
      );

      svgExports.push({
        name: node.name,
        svg: svgString,
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: `"${node.name}" 내보내기 실패: ${error.message}`,
      });
    }
  }

  figma.ui.postMessage({
    type: 'svg-exports',
    data: svgExports,
  });
}

// 메세지 핸들러
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'export-svg') {
    await exportSelectedNodesToSvg();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};
