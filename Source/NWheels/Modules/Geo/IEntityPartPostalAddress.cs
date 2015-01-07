﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NWheels.Modules.Geo
{
    public interface IEntityPartPostalAddress
    {
        ICountryEntity Country { get; set; }
        ICountryStateEntity State { get; set; }
        ICityEntity City { get; set; }
        IZipCodeEntity ZipCode { get; set; }
        string StreetAddress1 { get; set; }
        string StreetAddress2 { get; set; }
    }
}
