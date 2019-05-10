### Generate a static site from a leveldb store

## Setup

### Config file

The exporter reads the `config.json` file to get the relevant paths:
pat

```json
{
  "dist": "/path/to/export/directory",
  "quiverdb": "/path/to/leveldb/directory"
}
```
