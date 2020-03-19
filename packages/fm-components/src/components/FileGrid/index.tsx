import React, { Component } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';

import { NavContextProps, withContext } from '../../context/NavContext';
import { FileType, getDirFiles, getPathSet, getRootDirId } from '../../types';
import { Add } from '../Add';

import { FileIconList } from './FileIconList';

interface IProps extends NavContextProps {
  onAdd: (file: FileType) => void;
  onDelete: (id: string) => void;
}

interface IState {
  files: FileType[];
}

class FileGridComp extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      files: []
    };
  }
  // 判断路径是否准确，不准确则跳转到根路径
  componentDidMount() {
    if (!getPathSet(this.props.fileMap).has(this.props.currentDirId)) {
      this.props.onUpdateCurrentDir(getRootDirId(this.props.fileMap));
    } else {
      this.onRefresh(this.props);
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.currentDirId !== this.props.currentDirId ||
      nextProps.fileMap !== this.props.fileMap
    ) {
      this.onRefresh(nextProps);
    }
  }

  onRefresh(props: IProps) {
    const { currentDirId, fileMap } = props;

    const files = getDirFiles(currentDirId, fileMap);

    this.setState({ files });
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.location.pathname === nextProps.location.pathname) {
  //     if (entriesAreSame(this.props.entry, nextProps.entry)) {
  //       return false;
  //     }
  //     return true;
  //   }
  //   return true;
  // }

  onDragEnd = (result: DropResult) => {
    // super simple, just removing the dragging item
    if (result.combine) {
      const files: FileType[] = [...this.state.files];
      files.splice(result.source.index, 1);
      this.setState({ files });
      return;
    }

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    if (result.destination.index !== result.source.index) {
      const { files } = this.state;
      const startIndex = result.source.index;
      const endIndex = result.destination.index;

      const resp = Array.from(files);
      const [removed] = resp.splice(startIndex, 1);
      resp.splice(endIndex, 0, removed);

      this.setState({ files: resp });
    }
  };

  render() {
    const { currentDirId, onDelete } = this.props;

    return (
      <Container>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <FileIconList files={this.state.files} listType="FileIconList" onDelete={onDelete} />
        </DragDropContext>
        <Add
          onAdd={value => {
            console.log(value);
            this.props.onAdd({
              ...value,
              parentId: currentDirId
            });
          }}
        />
      </Container>
    );
  }
}

export const FileGrid = withContext(FileGridComp);

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 40px 0;
`;
