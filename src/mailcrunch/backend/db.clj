(ns mailcrunch.backend.db
  (:use [korma.db :only [defdb postgres]]))

(defdb prod (postgres {:db "mailcrunch"
                       :user "mailcrunch"
                       :password "n1c013tt0."
                       :delimiters ""}))
