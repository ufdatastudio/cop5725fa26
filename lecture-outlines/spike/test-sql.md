---
marp: true
theme: cop5725
paginate: true
html: true
---

# SQL runner test deck

---

## Runnable — scalar

```sql run
SELECT 6 * 7 AS answer, 'duckdb' AS engine;
```

---

## Runnable — multi-statement

```sql run
CREATE OR REPLACE TABLE student(id INTEGER, name VARCHAR, gpa DOUBLE);
INSERT INTO student VALUES (1,'Ada',3.9),(2,'Bose',3.4),(3,'Chen',3.7);
SELECT name, gpa FROM student ORDER BY gpa DESC;
```

---

## Not runnable — plain sql block

```sql
SELECT * FROM this_should_stay_static;
```
