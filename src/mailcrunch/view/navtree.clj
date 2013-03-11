(ns mailcrunch.view.navtree
  (:use [liberator.core :only [defresource]]
        [cheshire.core :only [generate-string]]
        [mailcrunch.model.navtree])
  )


(defresource handler
  :handle-ok  (get-navtree)
  :available-media-types ["text/json" "application/json"]  )
