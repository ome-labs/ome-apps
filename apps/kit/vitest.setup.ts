import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// klarity's preset runs without globals, so Testing Library can't register its own cleanup.
afterEach(cleanup);
