export const SmallIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_dd_23_640)">
      <rect
        x="6"
        y="1"
        width="16"
        height="16"
        rx="4"
        fill="url(#paint0_linear_23_640)"
      />
      <path
        d="M15.4831 12.7173C15.4081 12.7923 15.3064 12.8344 15.2003 12.8344C15.0943 12.8344 14.9925 12.7923 14.9175 12.7173L14.2831 12.0829C14.2081 12.0079 14.166 11.9062 14.166 11.8001C14.166 11.694 14.2081 11.5923 14.2831 11.5173L16.5175 9.28289C16.5925 9.2079 16.6943 9.16577 16.8003 9.16577C16.9064 9.16577 17.0081 9.2079 17.0831 9.28289L17.7175 9.91729C17.7925 9.9923 17.8346 10.094 17.8346 10.2001C17.8346 10.3062 17.7925 10.4079 17.7175 10.4829L15.4831 12.7173Z"
        stroke="white"
        stroke-width="0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16.4 9.4L15.85 6.6504C15.835 6.57559 15.799 6.50662 15.7461 6.45163C15.6933 6.39663 15.6258 6.3579 15.5516 6.34L10.494 5.0112C10.4274 4.99509 10.3577 4.99638 10.2917 5.01493C10.2257 5.03348 10.1656 5.06869 10.1172 5.11716C10.0687 5.16563 10.0335 5.22574 10.0149 5.29173C9.99638 5.35772 9.99509 5.42737 10.0112 5.494L11.34 10.5516C11.3579 10.6258 11.3966 10.6933 11.4516 10.7461C11.5066 10.799 11.5756 10.835 11.6504 10.85L14.4 11.4"
        stroke="white"
        stroke-width="0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.1201 5.11987L13.0345 8.03427"
        stroke="white"
        stroke-width="0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.6003 9.40005C14.0421 9.40005 14.4003 9.04188 14.4003 8.60005C14.4003 8.15822 14.0421 7.80005 13.6003 7.80005C13.1585 7.80005 12.8003 8.15822 12.8003 8.60005C12.8003 9.04188 13.1585 9.40005 13.6003 9.40005Z"
        stroke="white"
        stroke-width="0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <filter
        id="filter0_dd_23_640"
        x="0.514286"
        y="0.0857145"
        width="26.9714"
        height="26.9714"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feMorphology
          radius="1.82857"
          operator="erode"
          in="SourceAlpha"
          result="effect1_dropShadow_23_640"
        />
        <feOffset dy="1.82857" />
        <feGaussianBlur stdDeviation="1.37143" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_23_640"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feMorphology
          radius="1.37143"
          operator="erode"
          in="SourceAlpha"
          result="effect2_dropShadow_23_640"
        />
        <feOffset dy="4.57143" />
        <feGaussianBlur stdDeviation="3.42857" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_dropShadow_23_640"
          result="effect2_dropShadow_23_640"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_23_640"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_23_640"
        x1="6"
        y1="1"
        x2="22"
        y2="17"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#3B82F6" />
        <stop offset="0.5" stop-color="#1D4ED8" />
        <stop offset="1" stop-color="#1E40AF" />
      </linearGradient>
    </defs>
  </svg>
);
