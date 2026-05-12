# All Papers Downloaded

All 29 cited papers are now in this directory, fetched by
`scripts/fetch_papers.sh` from publisher, author, or course-page mirrors.

To re-fetch after a fresh clone or update, run:

```bash
bash scripts/fetch_papers.sh
```

The script is idempotent — existing files are skipped.

## Source URLs

| Filename | Citation | Hosted at |
|----------|----------|-----------|
| `codd1970.pdf` | Codd, *A Relational Model of Data for Large Shared Data Banks*, CACM 1970 | UPenn course mirror |
| `codd1972.pdf` | Codd, *Further Normalization*, Courant 1972 | TTM forum archive |
| `chen1976.pdf` | Chen, *The Entity-Relationship Model*, ACM TODS 1(1) | Weichselbraun mirror |
| `selinger1979.pdf` | Selinger et al., *Access Path Selection*, SIGMOD 1979 | UC Berkeley CS262 |
| `comer1979.pdf` | Comer, *The Ubiquitous B-Tree*, ACM Computing Surveys | carlosproal.com mirror |
| `bernstein1981.pdf` | Bernstein & Goodman, *Concurrency Control in Distributed DB*, 1981 | UC Berkeley CS262 |
| `chamberlin1981.pdf` | Chamberlin et al., *A History and Evaluation of System R*, CACM 1981 | CMU 15-721 mirror |
| `kent1983.pdf` | Kent, *A Simple Guide to Five Normal Forms*, CACM 26(2), 1983 | Bayreuth mirror |
| `mohan1992.pdf` | Mohan et al., *ARIES*, ACM TODS 17(1), 1992 | Stanford CS345D mirror |
| `graefe1994.pdf` | Graefe, *Volcano*, IEEE TKDE 6(1), 1994 | BU classics reading group |
| `mumick1990.pdf` | Mumick, Pirahesh, Ramakrishnan, *Magic of Duplicates and Aggregates*, VLDB 1990 | VLDB archive |
| `boncz2005.pdf` | Boncz, Zukowski, Nes, *MonetDB/X100*, CIDR 2005 | CIDR archive |
| `stonebraker2005.pdf` | Stonebraker et al., *C-Store*, VLDB 2005 | VLDB archive |
| `eisenberg2004.pdf` | Eisenberg et al., *SQL:2003 Has Been Published*, SIGMOD Record 2004 | SIGMOD Record |
| `hellerstein2007.pdf` | Hellerstein, Stonebraker, Hamilton, *Architecture of a Database System*, FnT 2007 | Berkeley DSF |
| `neumann2011.pdf` | Neumann, *Efficiently Compiling Efficient Query Plans*, PVLDB 2011 | VLDB archive |
| `corbett2012.pdf` | Corbett et al., *Spanner*, OSDI 2012 | USENIX archive |
| `diaconu2013.pdf` | Diaconu et al., *Hekaton*, SIGMOD 2013 | Microsoft Research |
| `leis2013.pdf` | Leis, Kemper, Neumann, *Adaptive Radix Tree*, ICDE 2013 | TUM database group |
| `bailis2014.pdf` | Bailis et al., *Highly Available Transactions*, PVLDB 2014 | VLDB archive |
| `leis2015.pdf` | Leis et al., *How Good Are Query Optimizers, Really?*, PVLDB 2015 | VLDB archive |
| `dageville2016.pdf` | Dageville et al., *The Snowflake Elastic Data Warehouse*, SIGMOD 2016 | Snowflake.com |
| `verbitski2017.pdf` | Verbitski et al., *Amazon Aurora*, SIGMOD 2017 | Stanford CS245 mirror |
| `kraska2018.pdf` | Kraska et al., *The Case for Learned Index Structures*, SIGMOD 2018 | arXiv |
| `raasveldt2019.pdf` | Raasveldt & Mühleisen, *DuckDB*, SIGMOD 2019 | DuckDB.org |
| `oneil1996.pdf` | O'Neil et al., *The LSM-Tree*, Acta Informatica 1996 | UMass Boston (author) |
| `behm2022.pdf` | Behm et al., *Photon*, SIGMOD 2022 | UC Berkeley author copy |
| `pedreira2022.pdf` | Pedreira et al., *Velox*, PVLDB 2022 | VLDB archive |
| `hirn2023.pdf` | Hirn & Grust, *A Fix for the Fixation on Fixpoints*, CIDR 2023 | CIDR archive |

If any link rots, update `scripts/fetch_papers.sh` with a new mirror and
re-run. The fetcher uses Mozilla user-agent and a 30-second timeout per URL.
