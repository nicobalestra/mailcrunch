(ns mailcrunch.backend.db
  (:use     [korma.db :only [defdb postgres]])
  (:require [korma.core :as kc]))

(defdb prod (postgres {:db "mailcrunch"
                       :user "mailcrunch"
                       :password "n1c013tt0."
                       :delimiters ""}))


(defmacro q-number-of [ref & filter]
  `(let [basetmp# (-> (kc/select* ~ref)
                      (kc/aggregate (~'count :*) :count))]
    (if ~filter
       (-> basetmp#
            (kc/where ~filter))
      basetmp#)))


