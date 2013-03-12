(ns mailcrunch.view.delivery
  (:require [mailcrunch.model.delivery :as model]
            [cheshire.core :as ch])
  (:use [liberator.core :only [defresource]]))

(defresource handle-delivery-count
  :handle-ok (ch/generate-string  (first (model/count)))
  :available-media-types ["text/json" "application/json"]
 )


(defresource handle-delivery
  :handle-ok (ch/generate-string {:subject "Ciccio"})
  :available-media-types ["text/json" "application/json"]
 )
