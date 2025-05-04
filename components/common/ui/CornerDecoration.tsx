import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

type CornerPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface CornerDecorationProps {
  position: CornerPosition;
  color: string;
  size?: number;
  type?: 'ribbon' | 'marker' | 'simple' | 'curve' | 'leaf';
}

// リボン風の装飾SVG
const ribbonSVG = (color: string) => `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0C13.333 0 26.667 0 40 0C40 2 38 3 36 5C33 8 30 12 28 16C26 20 26 24 26 28C26 30.667 26 33.333 26 36C24.667 36 23.333 36 22 36C20.667 36 19.333 36 18 36C16.667 36 15.333 36 14 36C12.667 36 11.333 36 10 36C8.667 36 7.333 36 6 36C4.667 36 3.333 36 2 36C0.667 36 -0.667 36 -2 36C-2 34.667 -2 33.333 -2 32C-2 30.667 -2 29.333 -2 28C-2 26.667 -2 25.333 -2 24C-2 20 -2 16 0 12C2 8 6 4 10 2C13.333 0.667 16.667 0 20 0C13.333 0 6.667 0 0 0Z" fill="${color}"/>
</svg>
`;

// マーカー風の装飾SVG
const markerSVG = (color: string) => `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0C6.667 0 13.333 0 20 0C26.667 0 33.333 0 40 0C40 6.667 40 13.333 40 20C33.333 20 26.667 20 20 20C20 26.667 20 33.333 20 40C13.333 40 6.667 40 0 40C0 33.333 0 26.667 0 20C0 13.333 0 6.667 0 0Z" fill="${color}"/>
</svg>
`;

// シンプルな三角形の装飾SVG
const simpleSVG = (color: string) => `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0L40 0L40 40L0 0Z" fill="${color}"/>
</svg>
`;

// 曲線の装飾SVG
const curveSVG = (color: string) => `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0C13.333 0 26.667 0 40 0C40 13.333 40 26.667 40 40C26.667 40 13.333 40 0 40C0 26.667 0 13.333 0 0Z" fill="none" stroke="${color}" stroke-width="4"/>
  <path d="M0 0C13.333 13.333 26.667 26.667 40 40" stroke="${color}" stroke-width="4"/>
</svg>
`;

// 葉の装飾SVG
const leafSVG = (color: string) => `
<svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0C13.333 0 26.667 0 40 0C40 13.333 28 26.667 16 34C10.667 37.333 5.333 40 0 40C0 26.667 0 13.333 0 0Z" fill="${color}" opacity="0.3"/>
  <path d="M2 2C15.333 2 28.667 2 42 2M2 2C2 15.333 2 28.667 2 42" stroke="${color}" stroke-width="2.5"/>
  <path d="M5 5C15 15 25 25 35 35" stroke="${color}" stroke-width="1.5"/>
  <path d="M8 2C19 16 29 28 38 38" stroke="${color}" stroke-width="1.5"/>
  <path d="M2 8C16 19 28 29 38 38" stroke="${color}" stroke-width="1.5"/>
</svg>
`;

export default function CornerDecoration({ 
  position, 
  color, 
  size = 40, 
  type = 'ribbon' 
}: CornerDecorationProps) {
  // SVGを選択
  let svgXml;
  switch (type) {
    case 'ribbon':
      svgXml = ribbonSVG(color);
      break;
    case 'marker':
      svgXml = markerSVG(color);
      break;
    case 'simple':
      svgXml = simpleSVG(color);
      break;
    case 'curve':
      svgXml = curveSVG(color);
      break;
    case 'leaf':
      svgXml = leafSVG(color);
      break;
    default:
      svgXml = ribbonSVG(color);
  }
  
  // 位置に応じた回転角度
  let rotate = '0deg';
  if (position === 'topRight') rotate = '90deg';
  if (position === 'bottomRight') rotate = '180deg';
  if (position === 'bottomLeft') rotate = '270deg';
  
  return (
    <View 
      style={[
        styles.container,
        { width: size, height: size },
        styles[position],
        { transform: [{ rotate }] }
      ]}
    >
      <SvgXml xml={svgXml} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0.6,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
}); 