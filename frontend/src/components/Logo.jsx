function Logo({ tamano = 64 }) {
  return (
    <svg
      className="logo-huella"
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Refugio de Mascotas"
    >
      <circle cx="32" cy="32" r="32" fill="#f3f7cb" />
      <ellipse cx="32" cy="42" rx="12" ry="9.5" fill="#7ea0dc" />
      <ellipse cx="17" cy="30" rx="5" ry="6.5" fill="#7ea0dc" transform="rotate(-20 17 30)" />
      <ellipse cx="26" cy="21" rx="5" ry="6.5" fill="#7ea0dc" transform="rotate(-8 26 21)" />
      <ellipse cx="38" cy="21" rx="5" ry="6.5" fill="#7ea0dc" transform="rotate(8 38 21)" />
      <ellipse cx="47" cy="30" rx="5" ry="6.5" fill="#7ea0dc" transform="rotate(20 47 30)" />
    </svg>
  )
}

export default Logo