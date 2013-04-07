(ns mailcrunch.model.delivery
  (:require [mailcrunch.backend.delivery :as db]))

(defn count 
	([]      (db/count-delivery))
	([query] (db/count-delivery query)))

(defn get-deliveries 
	([]      (db/get-deliveries))
	([query] (db/get-deliveries query)))
	