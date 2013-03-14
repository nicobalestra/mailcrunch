(ns mailcrunch.model.delivery
  (:require [mailcrunch.backend.delivery :as db]))

(defn count [ & query]
  (db/count-delivery query))

(defn get-deliveries [& query]
  (db/get-deliveries query))