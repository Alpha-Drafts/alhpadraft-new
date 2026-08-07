/**
 * Browser-only wrapper for the Sapling SDK
 * This ensures Sapling is only initialized in browser environments
 */

/**
 * Browser-only wrapper for the Sapling SDK
 * This ensures Sapling is only initialized in browser environments
 */
import { SaplingConfig, SaplingEdit } from "@/types/sapling";

// Define a safe version of the Sapling API that works in both server and client environments
export const SaplingBrowser = {
  init: (config: SaplingConfig): Promise<boolean> => {
    if (typeof window === "undefined") return Promise.resolve(false);

    return new Promise(resolve => {
      try {
        import("@saplingai/sapling-js/observer")
          .then(({ Sapling }) => {
            // Initialize with local proxy endpoint instead of direct Sapling API
            if (Sapling && typeof Sapling.init === "function") {
              Sapling.init({
                key: "", // Empty key since the proxy will add the real key
                endpointHostname: window.location.origin, // Use current domain
                editPathname: "/api/v1/sapling/api/v1/edits", // Correct proxy path
                statusBadge:
                  config.statusBadge !== undefined ? config.statusBadge : true,
                mode: config.mode || "prod",
              });

              console.info("Sapling initialized successfully with proxy");

              // Set up an event listener for when Sapling is ready
              document.addEventListener("sapling:ready", () => {
                console.info("Sapling is ready to use");
              });

              // Set up an event listener for errors
              document.addEventListener("sapling:error", event => {
                console.error("Sapling error:", (event as CustomEvent).detail);
              });

              resolve(true);
            } else {
              console.error("Sapling API doesn't have an init method");
              resolve(false);
            }
          })
          .catch(err => {
            console.error("Failed to load Sapling:", err);
            resolve(false);
          });
      } catch (error) {
        console.error("Failed to initialize Sapling:", error);
        resolve(false);
      }
    });
  },

  /**
   * Trigger a manual grammar check on a specific element
   * @param element The specific element to check
   * @returns Promise resolving to success status
   */
  triggerCheck: (element: Element | null): Promise<boolean> => {
    if (typeof window === "undefined" || !element) {
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      try {
        import("@saplingai/sapling-js/observer")
          .then(({ Sapling }) => {
            if (
              typeof Sapling.unobserve === "function" &&
              typeof Sapling.observe === "function"
            ) {
              // Force a re-check by unobserving and then observing again
              Sapling.unobserve(element);
              setTimeout(() => {
                Sapling.observe(element);
                console.info(
                  "Sapling re-observation triggered for manual check.",
                );
                resolve(true);
              }, 100);
            } else {
              console.warn("Sapling observe/unobserve methods not available");
              resolve(false);
            }
          })
          .catch(err => {
            console.error("Failed to load Sapling for manual check:", err);
            resolve(false);
          });
      } catch (error) {
        console.error("Failed to trigger Sapling check:", error);
        resolve(false);
      }
    });
  },

  observe: (element: Element | null): Promise<boolean> => {
    if (typeof window === "undefined" || !element)
      return Promise.resolve(false);

    return new Promise(resolve => {
      try {
        import("@saplingai/sapling-js/observer")
          .then(({ Sapling }) => {
            Sapling.observe(element);
            console.info("Sapling now observing element");
            resolve(true);
          })
          .catch(err => {
            console.error("Failed to load Sapling for observation:", err);
            resolve(false);
          });
      } catch (error) {
        console.error("Failed to observe with Sapling:", error);
        resolve(false);
      }
    });
  },

  unobserve: (element: Element | null): Promise<boolean> => {
    if (typeof window === "undefined" || !element)
      return Promise.resolve(false);

    return new Promise(resolve => {
      try {
        import("@saplingai/sapling-js/observer")
          .then(({ Sapling }) => {
            Sapling.unobserve(element);
            console.info("Sapling stopped observing element");
            resolve(true);
          })
          .catch(err => {
            console.error("Failed to load Sapling for unobservation:", err);
            resolve(false);
          });
      } catch (error) {
        console.error("Failed to unobserve with Sapling:", error);
        resolve(false);
      }
    });
  },

  /**
   * Get all available edits/suggestions from Sapling
   * @returns Promise resolving to array of Sapling edits
   */
  getEdits: async (): Promise<SaplingEdit[]> => {
    if (typeof window === "undefined") return Promise.resolve([]);

    return new Promise(resolve => {
      try {
        import("@saplingai/sapling-js/observer")
          .then(({ Sapling }) => {
            if (Sapling && typeof Sapling.getEdits === "function") {
              const edits = Sapling.getEdits();
              console.info(`Retrieved ${edits.length} edits from Sapling`);
              resolve(edits);
            } else {
              console.warn("Sapling.getEdits method not available");
              resolve([]);
            }
          })
          .catch(err => {
            console.error("Failed to load Sapling for getting edits:", err);
            resolve([]);
          });
      } catch (error) {
        console.error("Failed to get Sapling edits:", error);
        resolve([]);
      }
    });
  },

  acceptEdit: (editId: string) => {
    if (typeof window === "undefined") return;

    try {
      import("@saplingai/sapling-js/observer")
        .then(({ Sapling }) => {
          Sapling.acceptEdit(editId);
        })
        .catch(err => {
          console.error(
            `Failed to load Sapling for accepting edit ${editId}:`,
            err,
          );
        });
    } catch (error) {
      console.error(`Failed to accept Sapling edit ${editId}:`, error);
    }
  },

  rejectEdit: (editId: string) => {
    if (typeof window === "undefined") return;

    try {
      import("@saplingai/sapling-js/observer")
        .then(({ Sapling }) => {
          Sapling.rejectEdit(editId);
        })
        .catch(err => {
          console.error(
            `Failed to load Sapling for rejecting edit ${editId}:`,
            err,
          );
        });
    } catch (error) {
      console.error(`Failed to reject Sapling edit ${editId}:`, error);
    }
  },
};
