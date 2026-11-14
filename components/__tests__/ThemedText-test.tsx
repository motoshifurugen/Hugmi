import * as React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ThemedText } from '../common/ThemedText';

it('子要素の文字を表示し、既定の文字サイズを当てる', async () => {
  let tree: ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  const text = tree!.root.findByType(ThemedText);
  expect(text.props.children).toBe('Snapshot test!');

  const json = tree!.toJSON();
  expect(json).not.toBeNull();
  const style = StyleSheet.flatten((json as renderer.ReactTestRendererJSON).props.style);
  expect(style.fontSize).toBe(16);
  expect(style.lineHeight).toBe(24);
});
