import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C12.195 3.883 19.695 4.032 21.75 10.5c2.06 6.474-3.69 11.624-7.44 11.624-3.75 0-8.49-4.884-8.49-8.625 0-3.74 3.585-5.955 5.625-5.955 1.345 0 2.25.75 2.25 1.5 0 .75-.9 1.5-2.25 1.5-1.5 0-2.01-1.334-2.31-2.115zM11.805 1.754a.75.75 0 01.353.646v4.162a.75.75 0 01-1.5 0V2.4a.75.75 0 011.147-.646zM3.75 12a.75.75 0 01.75-.75h4.162a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zM18 18.75a.75.75 0 01.646.353l2.046 3.543a.75.75 0 11-1.299.75l-2.046-3.543a.75.75 0 01.653-1.103z"
      clipRule="evenodd"
    />
  </svg>
);

export const MergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 3a1 1 0 00-1 1v1.5a.5.5 0 00.5.5H2v1.5H1.5a.5.5 0 00-.5.5v1.5h.5a.5.5 0 00.5-.5V8.5H2v1.5H1.5a.5.5 0 00-.5.5V12h.5a.5.5 0 00.5-.5V10.5H2v1.5H1.5a.5.5 0 00-.5.5V14h.5a.5.5 0 00.5-.5V12.5H2v1.5H1.5a.5.5 0 00-.5.5V16a1 1 0 001 1h1.5v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5H4.5v-1.5h1.5v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5H6.5v-1.5h1.5v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5H8.5v-1.5h1.5v.5a.5.5 0 00.5.5H12v-.5a.5.5 0 00-.5-.5h-1.5V8.5H12v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5h-1.5V6.5H12v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5h-1.5V4.5H12v.5a.5.5 0 00.5.5h1.5v-.5a.5.5 0 00-.5-.5h-1.5V3H12a1 1 0 00-1-1H9a1 1 0 00-1 1v1.5H6.5V3H5a1 1 0 00-1 1v1.5H2.5V4a1 1 0 00-1-1H1zm15.65 2.85a.75.75 0 00-1.06-1.06L15.5 5.94l-1.09-1.09a.75.75 0 00-1.06 1.06L14.44 7l-1.09 1.09a.75.75 0 001.06 1.06L15.5 8.06l1.09 1.09a.75.75 0 001.06-1.06L16.56 7l1.09-1.09zM15.5 12a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

export const UnmergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-13zM9.5 4v1.5h-5V4h5zm-5 6.5v-1.5h5V12h-5zm0 3.5v-1.5h5V17h-5z" />
    <path d="M11.914 4.5l2.086 2.086-2.086 2.086-1.06-1.06L12 6.5l-1.146-1.147 1.06-1.06zM15 12a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

export const BoldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M9.25 3.5a.75.75 0 000 1.5h.5c1.12 0 2.053.1.25 1.357-1.114.943-2.01 2.443-2.01 4.143 0 1.7.9 3.2 2.01 4.143-.803 1.257-1.13 1.357-2.25 1.357h-.5a.75.75 0 000 1.5h.5c1.483 0 2.836-.285 3.834-1.156a5.068 5.068 0 001.666-3.844c0-1.7-.9-3.2-2.01-4.143 1.114-.943 2.01-2.443 2.01-4.143a5.068 5.068 0 00-1.666-3.844C12.086 3.785 10.733 3.5 9.25 3.5h-.5zM10 5h.25c.983 0 1.75.895 1.75 2s-.767 2-1.75 2H10V5zM10 11h.25c.983 0 1.75.895 1.75 2s-.767 2-1.75 2H10v-4z" />
  </svg>
);

export const ItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M8.25 3.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM11 3.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0111 3.5zM8.25 14a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM11 14a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM10 7.22l1.693 5.078a.75.75 0 01-1.386.46l-1.693-5.078a.75.75 0 111.386-.46z" />
  </svg>
);

export const UnderlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M5.5 3.5A2.5 2.5 0 018 1h4a2.5 2.5 0 012.5 2.5V10a.75.75 0 01-1.5 0V3.5a1 1 0 00-1-1H8a1 1 0 00-1 1V10a.75.75 0 01-1.5 0V3.5zM4 14a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 14z" />
  </svg>
);

export const TextColorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 3.75a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75z" />
    <path d="M5.25 4.5a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5z" />
    <path fillRule="evenodd" d="M3 16.75A.75.75 0 013.75 16h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 16.75z" clipRule="evenodd" />
  </svg>
);

export const BgColorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M1 4.75A.75.75 0 011.75 4h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 4.75zM1 15.25A.75.75 0 011.75 14h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 15.25zM12 9.5a.75.75 0 01-.75-.75V6.47l-1.12 1.68a.75.75 0 01-1.26-.84l2.5-3.75a.75.75 0 011.26 0l2.5 3.75a.75.75 0 11-1.26.84L12.75 6.47V8.75A.75.75 0 0112 9.5z" clipRule="evenodd" />
  </svg>
);

export const AlignLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 9.75A.75.75 0 012.75 9h9.5a.75.75 0 010 1.5h-9.5A.75.75 0 012 9.75zm0 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z" clipRule="evenodd" />
  </svg>
);

export const AlignCenterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM5.25 9.75A.75.75 0 016 9h8a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm-3 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z" clipRule="evenodd" />
  </svg>
);

export const AlignRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM7.75 9.75A.75.75 0 018.5 9H17a.75.75 0 010 1.5H8.5A.75.75 0 017.75 9.75zm-5 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 14.75z" clipRule="evenodd" />
  </svg>
);

export const AlignTopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 3.75A.75.75 0 013.75 3h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 3.75zM3 7.75A.75.75 0 013.75 7h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 013 7.75z" />
  </svg>
);

export const AlignMiddleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 9.75A.75.75 0 013.75 9h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zM3 5.75A.75.75 0 013.75 5h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 013 5.75z" />
  </svg>
);

export const AlignBottomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3 16.75A.75.75 0 013.75 16h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 16.75zM3 12.75A.75.75 0 013.75 12h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 01-.75-.75z" />
  </svg>
);

export const UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
  </svg>
);

export const RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 00.025 1.06l4.146 3.958H6.375a5.375 5.375 0 000 10.75H9.25a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z" clipRule="evenodd" />
  </svg>
);
