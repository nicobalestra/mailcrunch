(ns mailcrunch.model.delivery
  (:require [mailcrunch.backend.delivery :as db])
	(:use [clojure.pprint :only [pprint]]))

(defn count 
	([]      (db/count-delivery))
	([query] (db/count-delivery query)))

(defn get-deliveries 
	([]      (db/get-deliveries))
	([query] (db/get-deliveries query)))

(defn save-delivery [delivery]
	(print "Delivery: ")
	(pprint delivery)
	(if (delivery :id)
		(db/update-delivery delivery)
		(db/insert-delivery delivery)))
	