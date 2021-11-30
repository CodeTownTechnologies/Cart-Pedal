import React from 'react';
import {Text} from 'react-native';

var textIndex = 0;

export default class TextHighLight extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {highlight, caseSensitive, children, highlightStyle} = this.props;

    const sections = sectionString(highlight, children, caseSensitive);
    const renderedText = sections.map((section) => {
      var style = section.highlight == true ? highlightStyle : null;
      var index = textIndex++;
      return (
        <Text key={'text-highlight-element-' + index} style={style}>
          {section.text}
        </Text>
      );
    });

    return <Text {...this.props}>{renderedText}</Text>;
  }
}

TextHighLight.defaultProps = {
  highlight: null,
  str: '',
  caseSensitive: false,
};

const sectionString = (highlight, origStr, caseSensitive) => {
  //Sanity check
  if (!highlight || !origStr) {
    return [{text: origStr}];
  }

  var indices = [];
  var startIndex = 0;
  var searchStrLen = highlight.length;
  var index;
  var str = origStr;

  if (!caseSensitive) {
    str = str.toLowerCase();
    highlight = highlight.toLowerCase();
  }

  while ((index = str.indexOf(highlight, startIndex)) > -1) {
    if (index > 0) {
      indices.push({
        text: origStr.substring(startIndex, index),
      });
    }
    startIndex = index + searchStrLen;
    indices.push({
      highlight: true,
      text: origStr.substring(index, startIndex),
    });
  }
  if (startIndex < str.length) {
    indices.push({text: origStr.substring(startIndex, str.length)});
  }
  return indices;
};
