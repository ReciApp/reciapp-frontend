import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthLayout } from "../components/ui/Primitivos";

export default function AuthPage() {
  const { pathname } = useLocation();
  const brandSide = pathname.startsWith("/register") ? "right" : "left";

  return (
    <AuthLayout brandSide={brandSide}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
