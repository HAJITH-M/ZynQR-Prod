import { Link } from "react-router-dom";
import authImage from "../../assets/AuthImage.png";

/** Centered brand image above the form until the desktop split layout (`lg`) shows the brand panel. */
export default function AuthFormLogo({ className = "" }) {
  return (
    <div className={`mb-6 flex justify-center lg:hidden ${className}`}>
      <Link
        aria-label="ZynQR — go to home"
        className="block transition-opacity hover:opacity-90"
        to="/"
      >
        <img
          alt="ZynQR"
          className="h-auto w-[min(260px,82vw)] max-h-32 object-contain sm:w-[min(320px,78vw)] sm:max-h-40"
          decoding="async"
          height={160}
          src={authImage}
          width={320}
        />
      </Link>
    </div>
  );
}
