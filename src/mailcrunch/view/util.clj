(ns mailcrunch.view.util
  (:require [cheshire.core :as ch]))

(defn get-ids-from-ctx [ctx]
  (-> ctx
      (get-in [:request :form-params] )
      (first)
      (val)
      (ch/parse-string true)
      (:id)))
