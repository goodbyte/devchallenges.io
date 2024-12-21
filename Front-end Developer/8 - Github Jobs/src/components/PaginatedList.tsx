import React, { ReactNode } from 'react';

export interface Pagination {
  total_records: number;
  current_page: number;
  per_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

interface Data {
  data: unknown[];
  pagination: Pagination;
}

interface PropTypes {
  list: Data;
  isLoading: boolean;
  templateCallback: (...args: any) => unknown;
  placeholder: ReactNode;
  emptyMessage: string;
  maxButtons: number;
  onPageChanged: Function;
}

function PaginatedList(props: PropTypes) {
  const {
    list,
    isLoading,
    placeholder,
    emptyMessage,
    templateCallback,
    maxButtons,
    onPageChanged
  } = props;
  const { current_page, total_pages } = list.pagination;

  let pagNumbers: number[] = [current_page];

  for (let i = maxButtons - 1, buttonsLeft = i; i > 0; i--) {
    const firstNumber = pagNumbers[0];
    const lastNumber = pagNumbers[pagNumbers.length - 1];

    if (buttonsLeft && lastNumber < total_pages) {
      pagNumbers.push(lastNumber + 1);
      buttonsLeft--;
    }

    if (buttonsLeft && firstNumber > 1) {
      pagNumbers.unshift(firstNumber - 1);
      buttonsLeft--;
    }
  }

  const pagButtons = pagNumbers.map((num, index, arr) => {
    let text = num;
    let preSeparator = false;
    let postSeparator = false;
    
    if (index === 0 && num !== 1 && maxButtons > 4) {
      text = 1;
      postSeparator = true;
    }

    if (index === arr.length - 1 && num < total_pages) {
      text = total_pages;
      preSeparator = true;
    }

    return (
      <React.Fragment key={ text }>
        { preSeparator && <PagSeparator /> }
        <button
          className={ text === current_page ? 'active' : '' }
          onClick={ () => onPageChanged(text) }
        >
          { text }
        </button>
        { postSeparator && <PagSeparator /> }
      </React.Fragment>
    );
  });

  const pagBack = () => {
    if (current_page > 1) onPageChanged(current_page - 1);
  };

  const pagNext = () => {
    if (current_page < total_pages) onPageChanged(current_page + 1);
  };

  const pagination = (
    <div className="pagination">
      <button
        disabled={ current_page > 1 ? false : true }
        onClick={ pagBack }
      >
        <i className="material-icons">chevron_left</i>
      </button>
      { pagButtons }
      <button
        disabled={ current_page < total_pages ? false : true}
        onClick={ pagNext }
      >
        <i className="material-icons">chevron_right</i>
      </button>
    </div>
  );

  return (
    <>
      {
        isLoading ?
          placeholder :
          list?.data.length ?
            list.data.map(templateCallback) :
            emptyMessage
      }
      {
        total_pages > 1 && pagination
      }
    </>
  );
}

function PagSeparator() {
  return (
    <div className="pag__separator">
      <i className="material-icons">more_horiz</i>
    </div>
  );
}

export default PaginatedList;