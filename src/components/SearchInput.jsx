import React from 'react';
import './SearchInput.css';

// 一个简单的 SVG 搜索图标
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="search-icon"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);


export default function SearchInput({ value, onChange }) {
  return (
    <div className="search-input-wrapper">
      <SearchIcon />
      <input
        type="text"
        className="search-input"
        placeholder="搜索应用名称..."
        value={value}
        onChange={onChange}
      />
    </div>
  );
}