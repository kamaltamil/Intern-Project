import { Button } from "antd";

/**
 * LandingBanner
 *
 * Shared hero/landing image used across the Admin, Manager and Member
 * dashboards in place of a data table. Content (heading, subtext, button)
 * is passed in per-role so each dashboard can show relevant messaging
 * while reusing the same responsive image + overlay layout.
 */
const LandingBanner = ({
  image = "/landing/dashboard-hero.jpg",
  alt = "Hotel interior",
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-sm
                 h-48 sm:h-64 md:h-80 lg:h-96"
    >
      <img src={image} alt={alt} className="w-full h-full object-cover" />

      <div
        className="absolute inset-0 flex flex-col justify-center items-start p-4 sm:p-6 md:p-8"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)",
        }}
      >
        {title && (
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold mb-2">
            {title}
          </h2>
        )}

        {subtitle && (
          <p className="text-white/90 mb-4 max-w-md text-sm sm:text-base">
            {subtitle}
          </p>
        )}

        {actionLabel && onAction && (
          <Button
            type="primary"
            style={{ backgroundColor: "#C76A34", borderColor: "#C76A34" }}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LandingBanner;