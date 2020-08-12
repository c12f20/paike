/* @flow */

import React, { Component } from 'react';

import "./result-table.css"

import {
  Text,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/core";

import { CommonRenderer } from './common-renderer';

class ArrayDataRenderer extends Component {
  render() {
    const { value, colDef } = this.props;
    const { headerName, lineHeight } = colDef;
    if (value.array == null) {
      return (
        <CommonRenderer {...this.props} />
      );
    } else {
      return (
        <Popover usePortal>
          <PopoverTrigger>
            <div className="cell-wrap-text" style={{lineHeight: lineHeight+"px", marginTop: "5px", marginBottom: "5px"}}>{value.title}</div>
          </PopoverTrigger>
          <PopoverContent zIndex={4}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>{headerName}</PopoverHeader>
            <PopoverBody>
              {
                value.onItemClicked == null && value.array.map((item, index) => (
                  <Text key={index} >{item}</Text>
                ))
              }
              {
                value.onItemClicked != null && value.array.map((item, index) => (
                  <Text key={index}>
                    <Link onClick={() => {value.onItemClicked(index)}}>{item}</Link>
                  </Text>
                ))
              }
            </PopoverBody>
          </PopoverContent>
        </Popover>
      );
    }
  }
}

export { ArrayDataRenderer };
