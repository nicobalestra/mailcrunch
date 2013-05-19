(ns mailcrunch.view.meta
  (:require [mailcrunch.backend.meta :as model]
            [cheshire.core :as ch]
            [mailcrunch.view.util :as util])
  (:use [liberator.core :only [defresource request-method-in]]))


(defresource handle-meta-count
  :handle-ok (ch/generate-string  (first (model/count)))
  :available-media-types ["text/json" "application/json"]
 )


(defresource handle-entities [id]
        :handle-ok (if (not (nil? id))
                     (ch/generate-string (model/entities {:id (Integer. id)}))
                     (ch/generate-string (model/entities)))
        :available-media-types ["text/json" "application/json"]

 )
